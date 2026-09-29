const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'welcome', cat: 'admin', desc: 'Bienvenue', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  if (!['on', 'off'].includes(v)) return ctx.reply('Utilise : *welcome on* ou *welcome off*');
  protection.groupCfg(ctx.store, ctx.from).welcome = v === 'on';
  ctx.store.save();
  await ctx.reply(`${v === 'on' ? '🟢' : '🔴'} Message de *bienvenue* ${v === 'on' ? 'activé' : 'désactivé'}.`);
} });
