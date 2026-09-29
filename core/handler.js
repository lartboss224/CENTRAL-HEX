// Traitement des messages entrants — CENTRAL-HEX (bot sans préfixe)
const cfg = require('./config');
const db = require('./db');
const registry = require('./registry');
const protection = require('./protection');
const { num, unwrap, typeOf, textOf, pick, download } = require('../lib/util');

const metaCache = new Map(); // "session|group" -> { t, data }
const quizzes = new Map();   // "session|chat" -> { answer, until, sender }
const cooldown = new Map();

function attach(s) {
  if (!s.store) s.store = db.session(s.id);
  return s.store;
}

async function groupMeta(s, jid) {
  const k = s.id + '|' + jid;
  const c = metaCache.get(k);
  if (c && Date.now() - c.t < 60000) return c.data;
  try {
    const data = await s.sock.groupMetadata(jid);
    metaCache.set(k, { t: Date.now(), data });
    return data;
  } catch { return c?.data || null; }
}
const clearMeta = (sid, jid) => metaCache.delete(sid + '|' + jid);

// Tous les identifiants possibles d'un participant (numéro, LID, phoneNumber)
const ids = p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(num);

function roles(meta, s, sender) {
  const me = [s.sock.user?.id, s.sock.user?.lid].filter(Boolean).map(num);
  const who = [sender].filter(Boolean).map(num);
  let isAdmin = false, isBotAdmin = false;
  for (const p of meta?.participants || []) {
    const pid = ids(p);
    const adm = p.admin === 'admin' || p.admin === 'superadmin';
    if (adm && pid.some(x => who.includes(x))) isAdmin = true;
    if (adm && pid.some(x => me.includes(x))) isBotAdmin = true;
  }
  return { isAdmin, isBotAdmin };
}

// Cache des derniers messages (pour antidelete)
function remember(s, msg) {
  if (!msg.key?.id || !msg.message) return;
  s.cache.set(msg.key.id, msg);
  if (s.cache.size > 250) s.cache.delete(s.cache.keys().next().value);
}

async function handleRevoke(s, msg, ctxBase) {
  const proto = msg.message?.protocolMessage;
  if (!proto || proto.type !== 0 || !proto.key?.id) return false;
  const orig = s.cache.get(proto.key.id);
  if (!orig || orig.key.fromMe) return true;
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const g = isGroup ? protection.groupCfg(s.store, from) : null;
  const enabled = isGroup ? g.antidelete : s.store.data.dmAntiDelete;
  if (!enabled) return true;

  const target = isGroup ? from : s.sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const who = orig.key.participant || orig.key.remoteJid;
  const m = unwrap(orig.message);
  const type = typeOf(m);
  const head = `🗑️ *MESSAGE SUPPRIMÉ*\n👤 @${num(who)}${isGroup ? '' : '\n💬 Discussion privée'}\n`;
  try {
    if (type === 'conversation' || type === 'extendedTextMessage') {
      await s.sock.sendMessage(target, { text: `${head}\n${textOf(m)}`, mentions: [who] });
    } else if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
      const kind = type.replace('Message', '');
      const buf = await download(m[type], kind);
      await s.sock.sendMessage(target, { text: head, mentions: [who] });
      const payload = { [kind]: buf };
      if (kind === 'audio') payload.mimetype = 'audio/mp4';
      if (kind === 'document') { payload.mimetype = m[type].mimetype; payload.fileName = m[type].fileName; }
      if (m[type].caption) payload.caption = m[type].caption;
      await s.sock.sendMessage(target, payload);
    }
  } catch {}
  return true;
}

async function handle(s, ev) {
  if (ev.type !== 'notify' && ev.type !== 'append') return;
  const store = attach(s);
  const sock = s.sock;

  for (const msg of ev.messages) {
    try {
      if (!msg.message || !msg.key?.remoteJid) continue;
      const from = msg.key.remoteJid;
      if (from === 'status@broadcast' || from.endsWith('@newsletter') || from.endsWith('@broadcast')) continue;
      if (ev.type === 'append' && !msg.key.fromMe) continue;

      remember(s, msg);
      if (await handleRevoke(s, msg)) continue;

      const isGroup = from.endsWith('@g.us');
      const botNum = num(sock.user?.id);
      const sender = msg.key.fromMe
        ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
        : (isGroup ? (msg.key.participantAlt || msg.key.participant || msg.participant) : (msg.key.remoteJidAlt || from));
      if (!sender) continue;

      const m = unwrap(msg.message);
      const text = textOf(m).trim();
      const gl = db.global();
      gl.data.messages++;

      const isOwner = msg.key.fromMe || num(sender) === botNum || cfg.SUDO.includes(num(sender));
      let meta = null, isAdmin = false, isBotAdmin = false;
      if (isGroup) {
        meta = await groupMeta(s, from);
        ({ isAdmin, isBotAdmin } = roles(meta, s, sender));
        // Compteur de messages (classement wcg / profile)
        const g = protection.groupCfg(store, from);
        g.counts = g.counts || {};
        g.counts[num(sender)] = (g.counts[num(sender)] || 0) + 1;
        if (g.counts[num(sender)] % 10 === 0) store.save();
      }

      const ctx = buildCtx({ s, msg, m, from, sender, text, isGroup, isOwner, isAdmin, isBotAdmin, meta });

      // Protections (groupes)
      if (await protection.run(ctx)) continue;

      // Réponse à un quiz en cours
      const qz = quizzes.get(s.id + '|' + from);
      if (qz && Date.now() < qz.until && /^[a-d]$/i.test(text) && !msg.key.fromMe) {
        quizzes.delete(s.id + '|' + from);
        const ok = text.toLowerCase() === qz.answer;
        await ctx.reply(ok ? `✅ Bonne réponse @${num(sender)} !` : `❌ Raté @${num(sender)}... la bonne réponse était *${qz.answer.toUpperCase()}* (${qz.label}).`, { mentions: [sender] });
        continue;
      }

      if (!text) continue;
      // Sans préfixe : la première parole = nom de commande (un éventuel . ! / est toléré)
      const parts = text.replace(/^[.!\/#]/, '').split(/\s+/);
      const name = parts.shift().toLowerCase();
      const cmd = registry.get(name);
      if (!cmd) continue;
      if (db.global().data.banned.includes(s.id)) continue;

      // Mode privé : seul le propriétaire peut utiliser le bot
      if (store.data.mode === 'private' && !isOwner) continue;
      if (cmd.owner && !isOwner) { await ctx.reply('🔒 Commande réservée au propriétaire du bot.'); continue; }
      if (cmd.group && !isGroup) { await ctx.reply('👥 Cette commande fonctionne uniquement dans un groupe.'); continue; }
      if (cmd.admin && !(isAdmin || isOwner)) { await ctx.reply('👑 Commande réservée aux admins du groupe.'); continue; }
      if (cmd.botAdmin && !isBotAdmin) { await ctx.reply('⚠️ Je dois être admin du groupe pour faire ça.'); continue; }

      // Anti-flood par utilisateur (1,2 s)
      const ck = s.id + '|' + num(sender);
      if (Date.now() - (cooldown.get(ck) || 0) < 1200 && !isOwner) continue;
      cooldown.set(ck, Date.now());
      if (cooldown.size > 2000) cooldown.clear();

      ctx.args = parts;
      ctx.q = parts.join(' ');
      ctx.cmd = name;
      gl.data.commands++;
      gl.save();
      if (!cmd.silent) await ctx.react('⏳');
      try {
        await cmd.run(ctx);
        if (!cmd.silent) await ctx.react('✅');
      } catch (e) {
        console.error(`[${s.id}] ${name}:`, e.message);
        if (cmd.silent) continue;
        await ctx.react('❌');
        await ctx.reply(`❌ Erreur sur *${name}* : ${String(e.message || e).slice(0, 180)}`);
      }
    } catch (e) {
      console.error(`[${s.id}] handler:`, e.message);
    }
  }
}

function buildCtx(b) {
  const { s, msg, m, from, sender, text, isGroup, isOwner, isAdmin, isBotAdmin, meta } = b;
  const sock = s.sock;
  const ctxInfo = m[typeOf(m)]?.contextInfo || {};
  const quoted = ctxInfo.quotedMessage ? unwrap(ctxInfo.quotedMessage) : null;
  const quotedSender = ctxInfo.participant || null;
  const mentioned = ctxInfo.mentionedJid || [];
  return {
    s, session: s, sock, msg, m, from, sender, text, isGroup, isOwner, isAdmin, isBotAdmin, meta,
    quoted, quotedSender, mentioned, quotedRaw: ctxInfo.quotedMessage || null, ctxInfo,
    store: s.store, pushName: msg.pushName || 'Utilisateur',
    args: [], q: '', cmd: '',
    reply: (t, extra = {}) => sock.sendMessage(from, { text: t, ...extra }, { quoted: msg }),
    send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
    react: async e => { try { await sock.sendMessage(from, { react: { text: e, key: msg.key } }); } catch {} },
    // Cible d'une commande : mention > réponse > numéro écrit
    target() {
      if (mentioned[0]) return mentioned[0];
      if (quotedSender) return quotedSender;
      const n = (this.args.join('').match(/\d{8,15}/) || [])[0];
      return n ? n + '@s.whatsapp.net' : null;
    },
    startQuiz: (data) => quizzes.set(s.id + '|' + from, data)
  };
}

// Bienvenue / au revoir / antipurge
async function onGroup(s, ev) {
  const store = attach(s);
  clearMeta(s.id, ev.id);
  await protection.antiPurge(s, ev);
  const g = protection.groupCfg(store, ev.id);
  if (ev.action !== 'add' && ev.action !== 'remove') return;
  if (ev.action === 'add' && !g.welcome) return;
  if (ev.action === 'remove' && !g.goodbye) return;
  const meta = await groupMeta(s, ev.id);
  const users = ev.participants.map(p => (typeof p === 'string' ? p : p.phoneNumber || p.id));
  for (const u of users) {
    const t = ev.action === 'add'
      ? pick([`👋 Bienvenue @${num(u)} dans *${meta?.subject || 'le groupe'}* !\nLis la description et respecte les règles. 🚀`,
        `🎉 @${num(u)} vient de rejoindre *${meta?.subject || 'le groupe'}* — fais comme chez toi !`])
      : pick([`👋 @${num(u)} a quitté le groupe. À la prochaine !`, `🚪 @${num(u)} s'en va... bonne continuation !`]);
    let pp = null;
    try { pp = await s.sock.profilePictureUrl(u, 'image'); } catch {}
    try {
      if (pp) await s.sock.sendMessage(ev.id, { image: { url: pp }, caption: t, mentions: [u] });
      else await s.sock.sendMessage(ev.id, { text: t, mentions: [u] });
    } catch {}
  }
}

module.exports = { handle, onGroup, groupMeta, clearMeta };
