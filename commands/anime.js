const { add } = require('../core/registry');
const cfg = require('../core/config');
const media = require('../lib/media');
const { getJson, getBuffer, firstOk } = require('../lib/util');

const TYPES = ['waifu', 'neko', 'shinobu', 'megumin', 'hug', 'pat', 'kiss', 'cuddle', 'smile', 'wave', 'happy', 'wink', 'dance', 'cry', 'blush', 'highfive'];
// types disponibles sur some-random-api
const SRA = { hug: 'hug', pat: 'pat', kiss: 'kiss', wink: 'wink', cry: 'cry' };

add({ name: 'anime', cat: 'search', desc: 'anime', async run(ctx) {
  const t = TYPES.includes((ctx.args[0] || '').toLowerCase()) ? ctx.args[0].toLowerCase() : 'waifu';
  const sources = [
    async () => (await getJson(`https://api.waifu.pics/sfw/${t}`)).url,
    async () => (await getJson(`https://nekos.best/api/v2/${t}`)).results?.[0]?.url,
    async () => (await getJson(`https://api.waifu.im/search?included_tags=${t === 'neko' ? 'maid' : 'waifu'}`)).images?.[0]?.url,
    async () => (await getJson(`https://nekos.life/api/v2/img/${['neko', 'waifu', 'hug', 'pat', 'kiss', 'cuddle', 'smile', 'wink', 'cry'].includes(t) ? t : 'waifu'}`)).url,
    async () => (await getJson(`https://api.some-random-api.com/animu/${SRA[t] || 'pat'}`)).link
  ];
  const url = await firstOk(sources);
  const caption = `🌸 *${t}*\n_Types : ${TYPES.join(', ')}_\n> ${cfg.BOT_NAME}`;
  try {
    const buf = await getBuffer(url);
    if (/\.gif(\?|$)/i.test(url)) {
      // GIF → sticker animé (WhatsApp n'anime pas les GIF envoyés comme image)
      try { return await ctx.send({ sticker: await media.toSticker(buf, 'video') }); } catch {}
    }
    return await ctx.send({ image: buf, caption });
  } catch {
    await ctx.send({ image: { url }, caption });
  }
} });
