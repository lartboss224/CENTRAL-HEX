const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'antimarabout', cat: 'protection', desc: 'Anti-marabout', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = ctx.isGroup ? protection.groupCfg(ctx.store, ctx.from).antimarabout : ctx.store.data.dmAntiDelete;
  if (!['on', 'off'].includes(v)) return ctx.reply(`🛡️ *Anti-marabout* : ${cur ? '🟢 activé' : '🔴 désactivé'}\nUtilise : *antimarabout on* ou *antimarabout off*`);
  const val = v === 'on';
  if (ctx.isGroup) protection.groupCfg(ctx.store, ctx.from).antimarabout = val; else ctx.store.data.dmAntiDelete = val;
  ctx.store.save();
  const need = ['antilink', 'antispam', 'antimarabout', 'antibot', 'antisticker', 'antipurge'].includes('antimarabout') && !ctx.isBotAdmin && val ? '\n⚠️ Attention : le bot doit être *admin* pour agir.' : '';
  await ctx.reply(`${val ? '🟢' : '🔴'} *Anti-marabout* ${val ? 'activé' : 'désactivé'}${ctx.isGroup ? '' : ' (discussions privées)'}.${need}`);
} });
