const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'antipurge', cat: 'protection', desc: 'Anti-purge', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = ctx.isGroup ? protection.groupCfg(ctx.store, ctx.from).antipurge : ctx.store.data.dmAntiDelete;
  if (!['on', 'off'].includes(v)) return ctx.reply(`🛡️ *Anti-purge* : ${cur ? '🟢 activé' : '🔴 désactivé'}\nUtilise : *antipurge on* ou *antipurge off*`);
  const val = v === 'on';
  if (ctx.isGroup) protection.groupCfg(ctx.store, ctx.from).antipurge = val; else ctx.store.data.dmAntiDelete = val;
  ctx.store.save();
  const need = ['antilink', 'antispam', 'antimarabout', 'antibot', 'antisticker', 'antipurge'].includes('antipurge') && !ctx.isBotAdmin && val ? '\n⚠️ Attention : le bot doit être *admin* pour agir.' : '';
  await ctx.reply(`${val ? '🟢' : '🔴'} *Anti-purge* ${val ? 'activé' : 'désactivé'}${ctx.isGroup ? '' : ' (discussions privées)'}.${need}`);
} });
