const { add } = require('../core/registry');
const media = require('../lib/media');
const { getJson, getBuffer } = require('../lib/util');

add({ name: 'emojimix', cat: 'search', desc: "mélange d'emojis", async run(ctx) {
  const [e1, e2] = (ctx.args[0] || '').split('+').map(s => s.trim());
  if (!e1 || !e2) return ctx.reply('😎 Utilise : *emojimix 😎+🥰*');
  const d = await getJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(e1)}_${encodeURIComponent(e2)}`);
  const url = d.results?.[0]?.url;
  if (!url) return ctx.reply('❌ Ces deux emojis ne peuvent pas être mélangés. Essaie-en d\'autres !');
  await ctx.send({ sticker: await media.toSticker(await getBuffer(url), 'image') });
} });
