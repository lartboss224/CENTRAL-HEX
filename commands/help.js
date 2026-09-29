const { add, get, all } = require('../core/registry');
const cfg = require('../core/config');
const HELP = require('../core/helpdata');

function access(c) {
  const a = [];
  if (c.owner) a.push('👑 propriétaire du bot uniquement');
  else if (c.admin) a.push('🛡️ admins du groupe');
  else a.push('👥 tout le monde');
  if (c.group) a.push('uniquement dans un groupe');
  if (c.botAdmin) a.push('le bot doit être admin');
  return a.join(' · ');
}

add({ name: 'help', cat: 'general', desc: 'aide sur le bot', async run(ctx) {
  const name = (ctx.args[0] || '').toLowerCase().replace(/^[.!\/#]/, '');
  if (!name) {
    return ctx.reply(`🆘 *AIDE — ${cfg.BOT_NAME}*\n\n` +
      `• Aucun préfixe : écris juste *menu*, *ping*, *sticker*…\n` +
      `• *help <commande>* explique une commande en détail (ex : *help humm*).\n` +
      `• Commandes de groupe : le bot doit être *admin* du groupe.\n` +
      `• Réponds à un message/média pour *sticker*, *toimg*, *save*, *waouh*, *humm*.\n` +
      `• Active une protection : *antilink on* / *antilink off*.\n` +
      `• Mode privé : seul le propriétaire utilise le bot (*mode private*).\n\n` +
      `👑 Propriétaire : ${cfg.OWNER.name}\n> ${cfg.BOT_NAME} 🇬🇳`);
  }
  const c = get(name), h = HELP[name];
  if (!c || !h) {
    const near = all().map(x => x.name).filter(n => n.startsWith(name.slice(0, 2)) || n.includes(name)).slice(0, 6);
    return ctx.reply(`❓ Commande *${name}* introuvable.${near.length ? `\nTu voulais dire : ${near.map(n => '*' + n + '*').join(', ')} ?` : ''}\nÉcris *menu* pour voir toutes les commandes.`);
  }
  await ctx.reply(`📖 *AIDE — ${name.toUpperCase()}*\n\n` +
    `📝 *Description*\n${h[0]}\n\n` +
    `⌨️ *Utilisation*\n${h[1]}\n\n` +
    `💡 *Exemple*\n${h[2]}\n\n` +
    `🔐 *Accès* : ${access(c)}\n\n> ${cfg.BOT_NAME} 🇬🇳`);
} });
