const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'goodbye', cat: 'admin', desc: 'Au revoir', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  if (!['on', 'off'].includes(v)) return ctx.reply('Utilise : *goodbye on* ou *goodbye off*');
  protection.groupCfg(ctx.store, ctx.from).goodbye = v === 'on';
  ctx.store.save();
  await ctx.reply(`${v === 'on' ? '🟢' : '🔴'} Message de *au revoir* ${v === 'on' ? 'activé' : 'désactivé'}.`);
} });
