const { add } = require('../core/registry');
const protection = require('../core/protection');

add({ name: 'antispam', cat: 'protection', desc: 'Anti-spam', group: true, admin: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = ctx.isGroup ? protection.groupCfg(ctx.store, ctx.from).antispam : ctx.store.data.dmAntiDelete;
  if (!['on', 'off'].includes(v)) return ctx.reply(`🛡️ *Anti-spam* : ${cur ? '🟢 activé' : '🔴 désactivé'}\nUtilise : *antispam on* ou *antispam off*`);
  const val = v === 'on';
  if (ctx.isGroup) protection.groupCfg(ctx.store, ctx.from).antispam = val; else ctx.store.data.dmAntiDelete = val;
  ctx.store.save();
  const need = ['antilink', 'antispam', 'antimarabout', 'antibot', 'antisticker', 'antipurge'].includes('antispam') && !ctx.isBotAdmin && val ? '\n⚠️ Attention : le bot doit être *admin* pour agir.' : '';
  await ctx.reply(`${val ? '🟢' : '🔴'} *Anti-spam* ${val ? 'activé' : 'désactivé'}${ctx.isGroup ? '' : ' (discussions privées)'}.${need}`);
} });
