const { add } = require('../core/registry');
const cfg = require('../core/config');
const find = require('../lib/find');
const { getJson, firstOk } = require('../lib/util');

add({ name: 'image', cat: 'editing', desc: 'chercher images', async run(ctx) {
  if (!ctx.q) return ctx.reply('🖼️ Utilise : *image chat mignon*');
  const q = encodeURIComponent(ctx.q);
  const urls = await firstOk([
    async () => { const u = find.imageUrls(await getJson(`https://christus-api.vercel.app/image/Pinterest?query=${q}&limit=10`)); return u.length ? u : null; },
    async () => { const u = find.imageUrls(await getJson(`https://api.giftedtech.my.id/api/search/pinterest?apikey=gifted&query=${q}`)); return u.length ? u : null; },
    async () => { const u = find.imageUrls(await getJson(`https://api.siputzx.my.id/api/s/pinterest?query=${q}`)); return u.length ? u : null; }
  ]);
  let sent = 0;
  for (const u of urls.sort(() => Math.random() - 0.5)) {
    if (sent >= 5) break;
    try { await ctx.send({ image: { url: u }, caption: sent === 0 ? `🖼️ *${ctx.q}*\n> ${cfg.BOT_NAME}` : undefined }); sent++; } catch {}
  }
  if (!sent) throw new Error('aucune image trouvée');
} });
