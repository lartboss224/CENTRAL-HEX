const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'antistatus', cat: 'protection', desc: 'Anti-statut', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = ctx.isGroup ? protection.groupCfg(ctx.store, ctx.from).antistatus : ctx.store.data.dmAntiDelete;
  if (!['on', 'off'].includes(v)) return ctx.reply(`🛡️ *Anti-statut* : ${cur ? '🟢 activé' : '🔴 désactivé'}\nUtilise : *antistatus on* ou *antistatus off*`);
  const val = v === 'on';
  if (ctx.isGroup) protection.groupCfg(ctx.store, ctx.from).antistatus = val; else ctx.store.data.dmAntiDelete = val;
  ctx.store.save();
  const need = ['antilink', 'antispam', 'antimarabout', 'antibot', 'antisticker', 'antipurge'].includes('antistatus') && !ctx.isBotAdmin && val ? '\n⚠️ Attention : le bot doit être *admin* pour agir.' : '';
  await ctx.reply(`${val ? '🟢' : '🔴'} *Anti-statut* ${val ? 'activé' : 'désactivé'}${ctx.isGroup ? '' : ' (discussions privées)'}.${need}`);
} });
