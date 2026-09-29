const { add } = require('../core/registry');
const cfg = require('../core/config');

add({ name: 'instagram', cat: 'search', desc: 'Instagram', async run(ctx) {
  const url = ctx.args.find(a => /instagram\.com|instagr\.am/i.test(a));
  if (!url) return ctx.reply('📸 Utilise : *instagram https://instagram.com/reel/…*');
  const { igdl } = require('ruhend-scraper');
  const d = await igdl(url);
  const items = (d?.data || []).filter(i => i?.url);
  if (!items.length) throw new Error('aucun média (compte privé ou lien invalide)');
  for (const it of items.slice(0, 5)) {
    const isVideo = it.type === 'video' || /\.mp4|video/i.test(it.url);
    await ctx.send(isVideo ? { video: { url: it.url }, caption: `📸 Instagram\n> ${cfg.BOT_NAME}` } : { image: { url: it.url }, caption: `📸 Instagram\n> ${cfg.BOT_NAME}` });
  }
} });
