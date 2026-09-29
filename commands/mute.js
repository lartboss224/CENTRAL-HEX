const { add } = require('../core/registry');

add({ name: 'mute', cat: 'admin', desc: 'fermer le groupe', group: true, admin: true, botAdmin: true, async run(ctx) {
  await ctx.sock.groupSettingUpdate(ctx.from, 'announcement');
  await ctx.reply('🔇 Groupe fermé : seuls les admins peuvent écrire.');
} });
