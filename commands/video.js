const { add } = require('../core/registry');
const cfg = require('../core/config');
const { ytFind, ytBuffer, info } = require('../lib/helpers');

add({ name: 'video', cat: 'search', desc: 'recherche vidéo', async run(ctx) {
  if (!ctx.q) return ctx.reply('🎥 Utilise : *video titre ou lien YouTube*');
  const v = await ytFind(ctx.q);
  if (v.seconds > 900) return ctx.reply('⏱️ Cette vidéo dépasse 15 minutes.');
  try { if (v.thumbnail) await ctx.send({ image: { url: v.thumbnail }, caption: info(v) + '\n\n⬇️ Téléchargement de la vidéo…' }); } catch {}
  const buf = await ytBuffer(v.url, 'mp4');
  await ctx.send({ video: buf, mimetype: 'video/mp4', fileName: `${v.title.replace(/[^\w\s-]/g, '')}.mp4`, caption: `🎬 *${v.title}*\n> ${cfg.BOT_NAME}` });
} });
