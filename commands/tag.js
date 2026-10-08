const { add } = require('../core/registry');
const { unwrap, textOf } = require('../lib/util');

// Tag caché (comme le @tous des admins) : tout le groupe est notifié,
// mais aucun nom ni numéro n'est affiché. Utilisable par TOUS les membres.
add({ name: 'tag', cat: 'admin', desc: 'mentionner tout le monde (caché)', group: true, async run(ctx) {
  let text = ctx.args.join(' ').trim();
  if (!text && ctx.quotedRaw) { try { text = textOf(unwrap(ctx.quotedRaw)).trim(); } catch {} }
  if (!text) text = '📣';
  const mentions = (ctx.meta?.participants || []).map(p => p.phoneNumber || p.id);
  if (!mentions.length) return ctx.reply('ℹ️ Impossible de récupérer les membres du groupe.');
  await ctx.sock.sendMessage(ctx.from, { text, mentions });
} });
