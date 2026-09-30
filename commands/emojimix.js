const { add } = require('../core/registry');
const media = require('../lib/media');
const { getJson, getBuffer, firstOk } = require('../lib/util');
const find = require('../lib/find');

const TENOR_KEYS = ['AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'];

add({ name: 'emojimix', cat: 'search', desc: "mélange d'emojis", async run(ctx) {
  // accepte « 😎+🥰 », « 😎 🥰 » et ignore les emojis en trop
  const parts = ctx.q.split(/[+\s,]+/).map(s => s.trim()).filter(Boolean);
  const [e1, e2] = parts;
  if (!e1 || !e2) return ctx.reply('😎 Utilise : *emojimix 😎+🥰*');

  const q = `${encodeURIComponent(e1)}_${encodeURIComponent(e2)}`;
  const sources = [
    ...TENOR_KEYS.map(key => async () => {
      const d = await getJson(`https://tenor.googleapis.com/v2/featured?key=${key}&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${q}`);
      const r = d.results?.[0];
      return r?.media_formats?.png_transparent?.url || find.imageUrls(r)[0] || null;
    }),
    async () => { const u = `https://emojik.vercel.app/s/${q}?size=512`; await getBuffer(u); return u; },
    async () => { const u = `https://emojik.vercel.app/s/${encodeURIComponent(e2)}_${encodeURIComponent(e1)}?size=512`; await getBuffer(u); return u; }
  ];
  let url;
  try { url = await firstOk(sources); } catch { url = null; }
  if (!url) return ctx.reply('❌ Ces deux emojis ne peuvent pas être mélangés (ou le service est indisponible). Essaie-en d\'autres !');
  await ctx.send({ sticker: await media.toSticker(await getBuffer(url), 'image') });
} });
