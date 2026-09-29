const { add } = require('../core/registry');
const cfg = require('../core/config');
const media = require('../lib/media');
const { download } = require('../lib/util');
const { pickMedia } = require('../lib/helpers');

add({ name: 'toimg', cat: 'editing', desc: 'convertir un sticker en image', async run(ctx) {
  const mm = pickMedia(ctx, ['stickerMessage']);
  if (!mm) return ctx.reply('👉 *Réponds à un sticker* avec *toimg*.');
  const r = await media.stickerToMedia(await download(mm.content, 'sticker'));
  await ctx.send(r.type === 'image' ? { image: r.data, caption: `🖼️ ${cfg.BOT_NAME}` } : { video: r.data, gifPlayback: true, caption: `🖼️ ${cfg.BOT_NAME}` });
} });
