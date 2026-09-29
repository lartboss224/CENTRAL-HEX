const { add } = require('../core/registry');
const cfg = require('../core/config');
const { ytFind, ytLink, info } = require('../lib/helpers');

add({ name: 'video', cat: 'search', desc: 'recherche vidéo', async run(ctx) {
  if (!ctx.q) return ctx.reply('🎥 Utilise : *video titre ou lien YouTube*');
  const v = await ytFind(ctx.q);
  if (v.seconds > 900) return ctx.reply('⏱️ Cette vidéo dépasse 15 minutes.');
  const link = await ytLink(v.url, 'mp4');
  await ctx.send({ video: { url: link }, mimetype: 'video/mp4', caption: info(v) + `\n> ${cfg.BOT_NAME}` });
} });
