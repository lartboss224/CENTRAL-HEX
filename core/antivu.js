// Anti-vue unique : dès qu'un média « vue unique » arrive dans une discussion où c'est activé,
// le bot l'affiche tout seul (aucune commande à taper).
//  • mode « chat »  : le média est renvoyé dans la discussion
//  • mode « prive » : le média est envoyé seulement au propriétaire du bot
const db = require('./db');
const { num, unwrap, download } = require('../lib/util');

const MEDIA = ['imageMessage', 'videoMessage', 'audioMessage'];
const MAX_SIZE = 40 * 1024 * 1024;
const seen = new Set(); // évite de traiter deux fois le même message

const cfgOf = store => {
  const c = store.data.antivu = store.data.antivu || {};
  c.chats = c.chats || {}; c.all = c.all || null;
  return c;
};
const modeFor = (c, jid) => c.chats[jid] || c.all || null;

const hasWrapper = (x, d = 0) => {
  if (!x || d > 5) return false;
  if (x.viewOnceMessage || x.viewOnceMessageV2 || x.viewOnceMessageV2Extension) return true;
  return hasWrapper(x.ephemeralMessage?.message, d + 1) || hasWrapper(x.documentWithCaptionMessage?.message, d + 1);
};

async function run(s, msg) {
  try {
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

    const c = cfgOf(db.session(s.id));
    const mode = modeFor(c, from);
    if (!mode) return;

    const m = unwrap(msg.message);
    const wrapped = hasWrapper(msg.message);
    const type = MEDIA.find(k => m[k] && (wrapped || m[k].viewOnce));
    if (!type) return;

    if (seen.has(msg.key.id)) return;
    seen.add(msg.key.id);
    if (seen.size > 500) seen.delete(seen.values().next().value);

    const node = m[type];
    if (Number(node.fileLength || 0) > MAX_SIZE) return;
    const kind = type.replace('Message', '');
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup
      ? (msg.key.participantAlt || msg.key.participant || msg.participant)
      : (msg.key.remoteJidAlt || from);

    const buf = await download(node, kind);
    const dest = mode === 'prive' ? s.sock.user.id.split(':')[0] + '@s.whatsapp.net' : from;
    const opts = mode === 'chat' ? { quoted: msg } : {};

    let where = '';
    if (mode === 'prive') {
      if (isGroup) { try { where = `\nGroupe : ${(await s.sock.groupMetadata(from)).subject}`; } catch {} }
      else where = '\nDiscussion privée';
    }
    const label = { image: 'photo', video: 'vidéo', audio: 'audio' }[kind];
    const caption = `👁️ *Vue unique révélée* (${label})\nDe : @${num(sender)}${where}` + (node.caption ? `\n\n${node.caption}` : '');
    const mentions = sender ? [sender] : [];

    if (kind === 'audio') {
      await s.sock.sendMessage(dest, { text: caption, mentions }, opts);
      await s.sock.sendMessage(dest, { audio: buf, mimetype: node.mimetype || 'audio/mp4', ptt: !!node.ptt }, opts);
    } else {
      await s.sock.sendMessage(dest, { [kind]: buf, caption, mentions }, opts);
    }
  } catch (e) {
    console.error(`[${s.id}] antivu:`, e.message);
  }
}


// Message arrivé SANS contenu (WhatsApp n'envoie pas toujours le média « vue unique » aux appareils liés comme le bot).
// On prévient le propriétaire (1 fois / 30 s / discussion) pour qu'il puisse répondre au message avec « waouh ».
const lastStub = new Map();
async function stub(s, msg) {
  try {
    const from = msg.key.remoteJid;
    if (!from || msg.key.fromMe || from === 'status@broadcast' || from.endsWith('@newsletter') || from.endsWith('@broadcast')) return;
    const c = cfgOf(db.session(s.id));
    const mode = modeFor(c, from);
    if (!mode) return;
    console.log(`[${s.id}] antivu: message reçu sans contenu (stub=${msg.messageStubType}, ${(msg.messageStubParameters || []).join(',')}) dans ${from}`);
    if (msg.messageStubType !== 2) return; // 2 = contenu non délivré
    const k = s.id + '|' + from;
    if (Date.now() - (lastStub.get(k) || 0) < 30000) return;
    lastStub.set(k, Date.now());
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? (msg.key.participantAlt || msg.key.participant) : (msg.key.remoteJidAlt || from);
    let where = isGroup ? '' : ' (discussion privée)';
    if (isGroup) { try { where = ` dans *${(await s.sock.groupMetadata(from)).subject}*`; } catch {} }
    await s.sock.sendMessage(s.sock.user.id.split(':')[0] + '@s.whatsapp.net', {
      text: `👁️ *Message reçu sans contenu*${where}\nDe : @${num(sender)}${msg.pushName ? ` (${msg.pushName})` : ''}\n\nC'est sans doute une *vue unique* : WhatsApp ne transmet pas toujours ces médias au bot.\n👉 Ouvre la discussion et réponds à ce message avec *waouh* pour le récupérer.`,
      mentions: sender ? [sender] : []
    });
  } catch (e) {
    console.error(`[${s.id}] antivu.stub:`, e.message);
  }
}

module.exports = { run, stub, cfgOf, modeFor };
