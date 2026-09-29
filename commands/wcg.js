const { add } = require('../core/registry');
const cfg = require('../core/config');
const protection = require('../core/protection');

add({ name: 'wcg', cat: 'search', desc: 'classement', group: true, async run(ctx) {
  const g = protection.groupCfg(ctx.store, ctx.from);
  const top = Object.entries(g.counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!top.length) return ctx.reply('📊 Pas encore de données : le classement se construit au fil des messages.');
  const medals = ['🥇', '🥈', '🥉'];
  await ctx.send({ text: `🏆 *CLASSEMENT DES MEMBRES ACTIFS*\n\n` + top.map(([n, c], i) => `${medals[i] || `*${i + 1}.*`} @${n} — ${c} msg`).join('\n') + `\n\n> ${cfg.BOT_NAME}`, mentions: top.map(([n]) => n + '@s.whatsapp.net') });
} });
