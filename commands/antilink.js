const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'antilink', cat: 'protection', desc: 'Anti-lien', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = ctx.isGroup ? protection.groupCfg(ctx.store, ctx.from).antilink : ctx.store.data.dmAntiDelete;
  if (!['on', 'off'].includes(v)) return ctx.reply(`🛡️ *Anti-lien* : ${cur ? '🟢 activé' : '🔴 désactivé'}\nUtilise : *antilink on* ou *antilink off*`);
  const val = v === 'on';
  if (ctx.isGroup) protection.groupCfg(ctx.store, ctx.from).antilink = val; else ctx.store.data.dmAntiDelete = val;
  ctx.store.save();
  const need = ['antilink', 'antispam', 'antimarabout', 'antibot', 'antisticker', 'antipurge'].includes('antilink') && !ctx.isBotAdmin && val ? '\n⚠️ Attention : le bot doit être *admin* pour agir.' : '';
  await ctx.reply(`${val ? '🟢' : '🔴'} *Anti-lien* ${val ? 'activé' : 'désactivé'}${ctx.isGroup ? '' : ' (discussions privées)'}.${need}`);
} });
