const { add } = require('../core/registry');
const cfg = require('../core/config');
const protection = require('../core/protection');

add({ name: 'settings', cat: 'general', desc: 'paramètres', async run(ctx) {
  const on = v => (v ? '🟢 ON' : '🔴 OFF');
  let t = `⚙️ *PARAMÈTRES — ${cfg.BOT_NAME}*\n\n📢 Mode : *${ctx.store.data.mode}*\n🗑️ Antidelete (privé) : ${on(ctx.store.data.dmAntiDelete)}\n`;
  if (ctx.isGroup) {
    const g = protection.groupCfg(ctx.store, ctx.from);
    t += `\n👥 *Ce groupe*\n` + ['welcome', 'goodbye', 'antilink', 'antispam', 'antimarabout', 'antidelete', 'antibot', 'antistatus', 'antisticker', 'antipurge']
      .map(k => `• ${k} : ${on(g[k])}`).join('\n');
    t += `\n\n🛡️ Bot admin : ${ctx.isBotAdmin ? 'oui ✅' : 'non ❌ (nécessaire pour les protections)'}`;
  } else t += '\n_Ouvre cette commande dans un groupe pour voir ses protections._';
  await ctx.reply(t);
} });
