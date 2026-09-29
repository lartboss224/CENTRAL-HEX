const { add } = require('../core/registry');
const cfg = require('../core/config');
const find = require('../lib/find');
const { getJson, firstOk, download } = require('../lib/util');

add({ name: 'facebook', cat: 'search', desc: 'Facebook', async run(ctx) {
  const url = ctx.args.find(a => /facebook\.com|fb\.watch|fb\.com/i.test(a));
  if (!url) return ctx.reply('📘 Utilise : *facebook https://facebook.com/…*');
  const u = encodeURIComponent(url);
  const link = await firstOk([
    async () => find.mediaUrl(await getJson(`https://api.hanggts.xyz/download/facebook?url=${u}`), /hd|sd|video|download|url/i),
    async () => find.mediaUrl(await getJson(`https://api.siputzx.my.id/api/d/facebook?url=${u}`), /hd|sd|video|download|url/i)
  ]);
  await ctx.send({ video: { url: link }, caption: `📘 Facebook\n> ${cfg.BOT_NAME}` });
} });
