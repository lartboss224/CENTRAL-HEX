const { add } = require('../core/registry');
const cfg = require('../core/config');
const { num, pick } = require('../lib/util');

add({ name: 'couple', cat: 'search', desc: 'couple', group: true, async run(ctx) {
  const me = num(ctx.sock.user.id);
  const pool = (ctx.meta?.participants || []).map(p => p.id).filter(j => num(j) !== me);
  if (pool.length < 2) return ctx.reply('👥 Il faut au moins 2 membres.');
  const a = pick(pool);
  const b = pick(pool.filter(x => x !== a));
  const pct = 40 + Math.floor(Math.random() * 61);
  await ctx.send({ text: `💘 *COUPLE DU JOUR*\n\n@${num(a)} ❤️ @${num(b)}\n\n💞 Compatibilité : *${pct}%*\n${pct > 85 ? '🔥 Mariage en vue !' : pct > 65 ? '😍 Ça peut marcher !' : '😅 Il y a du travail…'}\n\n> ${cfg.BOT_NAME}`, mentions: [a, b] });
} });
