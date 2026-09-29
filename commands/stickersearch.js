const { add } = require('../core/registry');
const media = require('../lib/media');
const { getJson, getBuffer, firstOk } = require('../lib/util');

add({ name: 'stickersearch', cat: 'editing', desc: 'rechercher sticker', async run(ctx) {
  if (!ctx.q) return ctx.reply('🔎 Utilise : *stickersearch chat*');
  const q = encodeURIComponent(ctx.q);
  const gifs = await firstOk([
    async () => { const d = await getJson(`https://tenor.googleapis.com/v2/search?q=${q}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&limit=10&media_filter=tinygif`); const a = d.results?.map(r => r.media_formats?.tinygif?.url).filter(Boolean); return a?.length ? a : null; },
    async () => { const d = await getJson(`https://api.giphy.com/v1/gifs/search?api_key=qnl7ssQChTdPjsKta2Ax2LMaGXz303tq&q=${q}&limit=10&rating=g`); const a = d.data?.map(r => r.images?.fixed_height_small?.url || r.images?.fixed_height?.url).filter(Boolean); return a?.length ? a : null; }
  ]);
  let n = 0;
  for (const u of gifs.sort(() => Math.random() - 0.5)) {
    if (n >= 4) break;
    try { await ctx.send({ sticker: await media.toSticker(await getBuffer(u), 'video') }); n++; } catch {}
  }
  if (!n) throw new Error('aucun sticker trouvé');
} });
