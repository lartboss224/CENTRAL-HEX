const { add } = require('../core/registry');
const { ytFind, ytLink, info } = require('../lib/helpers');

add({ name: 'song', cat: 'search', desc: 'musique', async run(ctx) {
  if (!ctx.q) return ctx.reply('🎵 Utilise : *song titre de la chanson*');
  const v = await ytFind(ctx.q);
  if (v.seconds > 1200) return ctx.reply('⏱️ Cette vidéo dépasse 20 minutes.');
  try { await ctx.send({ image: { url: v.thumbnail }, caption: info(v) + `\n\n⬇️ Envoi de l'audio…` }); } catch {}
  const link = await ytLink(v.url, 'mp3');
  await ctx.send({ audio: { url: link }, mimetype: 'audio/mpeg', fileName: `${v.title}.mp3` });
} });
