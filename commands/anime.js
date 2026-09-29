const { add } = require('../core/registry');
const cfg = require('../core/config');
const { getJson, firstOk } = require('../lib/util');

add({ name: 'anime', cat: 'search', desc: 'anime', async run(ctx) {
  const types = ['waifu', 'neko', 'shinobu', 'megumin', 'hug', 'pat', 'kiss', 'cuddle', 'smile', 'wave', 'happy', 'wink', 'dance', 'cry', 'blush', 'highfive'];
  const t = types.includes((ctx.args[0] || '').toLowerCase()) ? ctx.args[0].toLowerCase() : 'waifu';
  const url = await firstOk([
    async () => (await getJson(`https://api.waifu.pics/sfw/${t}`)).url,
    async () => (await getJson(`https://nekos.best/api/v2/${t}`)).results?.[0]?.url
  ]);
  await ctx.send({ image: { url }, caption: `🌸 *${t}*\n_Types : ${types.join(', ')}_\n> ${cfg.BOT_NAME}` });
} });
