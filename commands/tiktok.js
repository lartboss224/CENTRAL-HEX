const { add } = require('../core/registry');
const cfg = require('../core/config');
const { getJson, firstOk } = require('../lib/util');

add({ name: 'tiktok', cat: 'search', desc: 'TikTok', async run(ctx) {
  const url = ctx.args.find(a => /tiktok\.com|vm\.tiktok/i.test(a));
  if (!url) return ctx.reply('🎵 Utilise : *tiktok https://vm.tiktok.com/…*');
  const r = await firstOk([
    async () => { const d = (await getJson(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`)).data; return d?.play && { url: d.hdplay || d.play, title: d.title }; },
    async () => { const d = (await getJson(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`)).data; const u = d?.urls?.[0] || d?.video_url || d?.url; return u && { url: u, title: d?.metadata?.title }; }
  ]);
  await ctx.send({ video: { url: r.url }, caption: `🎵 ${r.title || 'TikTok'}\n> ${cfg.BOT_NAME}` });
} });
