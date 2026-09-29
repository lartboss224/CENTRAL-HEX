const { add } = require('../core/registry');
const cfg = require('../core/config');
const find = require('../lib/find');
const { getJson, firstOk } = require('../lib/util');

add({ name: 'lyrics', cat: 'editing', desc: 'obtenir les paroles', async run(ctx) {
  if (!ctx.q) return ctx.reply('🎤 Utilise : *lyrics titre artiste*');
  const q = encodeURIComponent(ctx.q);
  const r = await firstOk([
    async () => { const a = await getJson(`https://lrclib.net/api/search?q=${q}`); const x = a.find(i => i.plainLyrics); return x && { title: `${x.trackName} — ${x.artistName}`, text: x.plainLyrics }; },
    async () => { const d = await getJson(`https://lyricsapi.fly.dev/api/lyrics?q=${q}`); const t = find.firstText(d); return t.length > 60 && { title: ctx.q, text: t }; },
    async () => { const d = await getJson(`https://api.siputzx.my.id/api/s/lyrics?query=${q}`); const t = find.firstText(d); return t.length > 60 && { title: ctx.q, text: t }; }
  ]);
  const text = r.text.length > 3800 ? r.text.slice(0, 3800) + '\n…' : r.text;
  await ctx.reply(`🎤 *${r.title}*\n\n${text}\n\n> ${cfg.BOT_NAME}`);
} });
