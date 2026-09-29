const { add } = require('../core/registry');
const protection = require('../core/protection');
const { num } = require('../lib/util');

add({ name: 'warn', cat: 'admin', desc: 'avertir un membre', group: true, admin: true, botAdmin: true, async run(ctx) {
  const t = ctx.target();
  if (!t) return ctx.reply('👉 Utilise : *warn @user*');
  const g = protection.groupCfg(ctx.store, ctx.from);
  g.warns = g.warns || {};
  const n = (g.warns[t] = (g.warns[t] || 0) + 1);
  ctx.store.save();
  if (n >= 3) {
    delete g.warns[t]; ctx.store.save();
    await ctx.reply(`⛔ @${num(t)} a atteint *3/3* avertissements : expulsion.`, { mentions: [t] });
    await ctx.sock.groupParticipantsUpdate(ctx.from, [t], 'remove');
  } else await ctx.reply(`⚠️ @${num(t)} : avertissement *${n}/3*.`, { mentions: [t] });
} });
