const { add } = require('../core/registry');

// Même fonctionnement que ITACHI-XMD-V2 : un seul réglage, réservé au propriétaire.
// Les messages supprimés (groupes + privé) sont envoyés en privé au propriétaire du bot.
add({ name: 'antidelete', cat: 'protection', desc: 'Anti-suppression', owner: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  const cur = !!ctx.store.data.antidelete;

  if (!v) {
    return ctx.reply(`*CONFIGURATION ANTIDELETE*\n\nStatut actuel : ${cur ? '✅ Activé' : '❌ Désactivé'}\n\n*antidelete on* - Activer\n*antidelete off* - Désactiver`);
  }
  if (v !== 'on' && v !== 'off') return ctx.reply('*Commande invalide.* Utilise *antidelete* pour voir le mode d\'emploi.');

  ctx.store.data.antidelete = v === 'on';
  ctx.store.save();
  await ctx.reply(`*Antidelete ${v === 'on' ? 'activé' : 'désactivé'}*`);
} });
