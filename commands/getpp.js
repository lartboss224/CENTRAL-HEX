const { add } = require('../core/registry');
const { num } = require('../lib/util');

add({ name: 'getpp', cat: 'search', desc: 'photo de profil', async run(ctx) {
  const t = ctx.target() || ctx.sender;
  let url;
  try { url = await ctx.sock.profilePictureUrl(t, 'image'); } catch {}
  if (!url) return ctx.reply('🚫 Photo de profil introuvable (privée ou absente).');
  await ctx.send({ image: { url }, caption: `🖼️ Photo de profil de @${num(t)}`, mentions: [t] });
} });
