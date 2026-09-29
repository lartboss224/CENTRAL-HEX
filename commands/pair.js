const { add } = require('../core/registry');
const cfg = require('../core/config');
const sessions = require('../core/sessions');
const { num } = require('../lib/util');

const last = new Map();          // anti-abus : 1 code / 20 s par session
const POLL = 3000, MAX_WAIT = 5 * 60 * 1000;
const mask = n => n.length > 7 ? `+${n.slice(0, 3)} ${n.slice(3, 5)}${'•'.repeat(n.length - 7)}${n.slice(-2)}` : `+${n}`;
const places = () => `${Math.max(0, cfg.MAX_SESSIONS - sessions.count())}/${cfg.MAX_SESSIONS}`;
const isSudo = ctx => cfg.SUDO.includes(num(ctx.sender));

// Prévient dès que le numéro est lié (ou si la liaison échoue / expire)
function watch(ctx, id) {
  const start = Date.now();
  const t = setInterval(async () => {
    const st = sessions.pairState(id);
    if (st.connected) {
      clearInterval(t);
      return ctx.reply(`✅ *Connexion réussie !*\n📱 +${id} est maintenant relié à ${cfg.BOT_NAME}.\nIl peut écrire *menu* pour commencer.`).catch(() => {});
    }
    if (st.status === 'none' || Date.now() - start > MAX_WAIT) {
      clearInterval(t);
      ctx.reply(`⌛ La liaison de +${id} n'a pas abouti (code expiré ou refusé).\nRelance *pair ${id}* pour un nouveau code.`).catch(() => {});
    }
  }, POLL);
  t.unref?.();
}

add({ name: 'pair', cat: 'protection', desc: 'Connexion pair', owner: true, async run(ctx) {
  const sub = (ctx.args[0] || '').toLowerCase();

  // pair list / pair status <numéro> : réservés aux propriétaires du système (protège la vie privée des autres)
  if (sub === 'list' || sub === 'status') {
    if (!isSudo(ctx)) return ctx.reply('🔒 Cette option est réservée aux propriétaires du système.');
    if (sub === 'status') {
      const n = (ctx.args.join('').match(/\d{8,15}/) || [])[0];
      if (!n) return ctx.reply('👉 Utilise : *pair status 224XXXXXXXXX*');
      const st = sessions.pairState(n).status;
      const label = { open: '🟢 connecté', connecting: '🟡 connexion en cours', waiting_code: '🟡 en attente du code', waiting_qr: '🟡 en attente du QR', closed: '🔴 hors ligne', error: '🔴 erreur', none: '⚪ inconnu' }[st] || st;
      return ctx.reply(`📊 *+${n}* : ${label}`);
    }
    const l = sessions.list();
    return ctx.reply(`📱 *SESSIONS — ${cfg.BOT_NAME}*\n🟢 ${sessions.openCount()} en ligne · 👥 places : ${places()}\n\n` +
      (l.slice(0, 30).map(s => `${s.status === 'open' ? '🟢' : '🟡'} ${mask(s.id)}`).join('\n') || '_Aucune session_') + (l.length > 30 ? `\n… +${l.length - 30}` : ''));
  }

  const n = (ctx.args.join('').match(/\d{8,15}/) || [])[0];
  if (!n) {
    return ctx.reply(`🔗 *PAIR — CONNEXION D'UN NUMÉRO*\n\n` +
      `⌨️ *pair 224XXXXXXXXX* → génère un code de liaison\n` +
      `📊 *pair status 224XXXXXXXXX* → état d'un numéro _(propriétaires système)_\n` +
      `📱 *pair list* → sessions connectées _(propriétaires système)_\n\n` +
      `ℹ️ Numéro avec l'indicatif du pays, sans « + » (ex : 224 pour la Guinée).\n` +
      `👥 Places restantes : *${places()}*` + (cfg.PUBLIC_URL ? `\n🌐 Ou via le site : ${cfg.PUBLIC_URL}` : ''));
  }
  if (/^0/.test(n) || n.length < 10) {
    return ctx.reply(`⚠️ Le numéro *${n}* semble incomplet : ajoute l'indicatif du pays (ex : *224${n.replace(/^0+/, '')}*).`);
  }
  const k = ctx.s.id;
  if (Date.now() - (last.get(k) || 0) < 20000) return ctx.reply('⏳ Patiente 20 secondes avant de demander un nouveau code.');
  last.set(k, Date.now());

  let code;
  try { code = await sessions.startPair(n); }
  catch (e) { last.delete(k); return ctx.reply(`⚠️ ${e.message}`); }

  await ctx.reply(`🔗 *CODE DE CONNEXION*\n\n` +
    `📱 Numéro : *+${n}*\n🔑 Code : *${code}*\n⏳ Valable environ *60 secondes*\n👥 Places restantes : *${places()}*\n\n` +
    `1️⃣ Ouvre WhatsApp ▸ *Appareils connectés*\n2️⃣ *Connecter un appareil*\n3️⃣ *Lier avec le numéro de téléphone*\n4️⃣ Saisis le code (envoyé seul juste en dessous 👇, facile à copier)`);
  await ctx.send({ text: code });
  watch(ctx, n);
} });
