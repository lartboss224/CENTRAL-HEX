const { add } = require('../core/registry');
const { cfgOf, modeFor } = require('../core/antivu');

const label = m => (m === 'chat' ? '✅ activé (affiché dans la discussion)' : m === 'prive' ? '✅ activé (envoyé en privé au propriétaire)' : '❌ désactivé');

// antivu on / prive / off  → pour CETTE discussion (groupe ou privé)
// antivu tout on / prive / off → pour TOUTES les discussions (propriétaire)
for (const name of ['antivu', 'antivv', 'antivueunique']) {
  add({ name, cat: 'protection', desc: 'Anti-vue unique', async run(ctx) {
    const c = cfgOf(ctx.store);
    const a = ctx.args.map(x => x.toLowerCase());

    const allowed = ctx.isGroup ? (ctx.isAdmin || ctx.isOwner) : ctx.isOwner;
    const help = `👁️ *ANTI-VUE UNIQUE*\n\nIci : ${label(modeFor(c, ctx.from))}\nPartout : ${label(c.all)}\n\n*${name} on* : affiche les vues uniques dans la discussion\n*${name} prive* : les reçoit seulement en privé (plus discret)\n*${name} off* : désactiver\n*${name} tout on/prive/off* : toutes les discussions (propriétaire)\n\n_Quand c'est activé, aucune commande à taper : chaque média « vue unique » reçu est affiché automatiquement._`;

    if (!a[0]) return ctx.reply(help);

    // Toutes les discussions
    if (a[0] === 'tout' || a[0] === 'all') {
      if (!ctx.isOwner) return ctx.reply('🔒 Réservé au propriétaire du bot.');
      const v = a[1];
      if (!['on', 'prive', 'privé', 'off'].includes(v)) return ctx.reply(help);
      c.all = v === 'on' ? 'chat' : v === 'off' ? null : 'prive';
      ctx.store.save();
      return ctx.reply(`👁️ Anti-vue unique (toutes les discussions) : ${label(c.all)}`);
    }

    if (!allowed) return ctx.reply(ctx.isGroup ? '👑 Réservé aux admins du groupe.' : '🔒 Réservé au propriétaire du bot.');
    if (!['on', 'prive', 'privé', 'off'].includes(a[0])) return ctx.reply(help);

    if (a[0] === 'off') delete c.chats[ctx.from];
    else c.chats[ctx.from] = a[0] === 'on' ? 'chat' : 'prive';
    ctx.store.save();
    const note = a[0] === 'off' && c.all ? '\n\n_Attention : l\'option « tout » reste active pour toutes les discussions._' : '';
    await ctx.reply(`👁️ Anti-vue unique : ${label(modeFor(c, ctx.from))}${note}`);
  } });
}
