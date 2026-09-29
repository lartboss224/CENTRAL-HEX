const { add } = require('../core/registry');
const cfg = require('../core/config');
const { ddg } = require('../lib/helpers');

add({ name: 'google', cat: 'search', desc: 'recherche Google', async run(ctx) {
  if (!ctx.q) return ctx.reply('🔎 Utilise : *google ton sujet*');
  const res = await ddg(ctx.q);
  if (!res.length) throw new Error('aucun résultat');
  await ctx.reply(`🔎 *Résultats pour « ${ctx.q} »*\n\n` + res.map((r, i) => `*${i + 1}. ${r.title}*\n${r.snippet ? r.snippet.slice(0, 140) + '\n' : ''}🔗 ${r.href}`).join('\n\n') + `\n\n> ${cfg.BOT_NAME}`);
} });
