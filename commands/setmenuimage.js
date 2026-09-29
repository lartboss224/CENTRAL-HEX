const { add } = require('../core/registry');
const fs = require('fs');
const path = require('path');
const { download } = require('../lib/util');
const { MEDIA } = require('../lib/helpers');

add({ name: 'setmenuimage', cat: 'admin', desc: 'image du menu', owner: true, async run(ctx) {
  const url = ctx.args[0];
  if (url && /^https?:\/\//i.test(url)) { ctx.store.data.menuImage = url; ctx.store.save(); return ctx.reply('🖼️ Image du menu mise à jour (lien).'); }
  if (url === 'reset') { ctx.store.data.menuImage = null; ctx.store.save(); return ctx.reply('🖼️ Image du menu réinitialisée.'); }
  const src = ctx.m.imageMessage ? ctx.m : ctx.quoted;
  if (!src?.imageMessage) return ctx.reply('👉 Réponds à une *image* avec *setmenuimage*, ou envoie *setmenuimage <lien>*.');
  const buf = await download(src.imageMessage, 'image');
  const file = path.join(MEDIA, `menu_${ctx.s.id}.jpg`);
  fs.writeFileSync(file, buf);
  ctx.store.data.menuImage = file; ctx.store.save();
  await ctx.reply('🖼️ Nouvelle image du menu enregistrée.');
} });
