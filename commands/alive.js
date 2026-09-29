const { add } = require('../core/registry');
const cfg = require('../core/config');
const sessions = require('../core/sessions');
const os = require('os');
const { fmtBytes, fmtUptime } = require('../lib/util');
const { banner } = require('../lib/helpers');

add({ name: 'alive', cat: 'general', desc: 'état du bot', async run(ctx) {
  const mem = process.memoryUsage().rss;
  await banner(ctx, `✅ *${cfg.BOT_NAME} est en ligne 24h/24*\n\n` +
    `⏱️ Uptime : ${fmtUptime(process.uptime())}\n` +
    `🧠 RAM : ${fmtBytes(mem)} / ${fmtBytes(os.totalmem())}\n` +
    `👥 Sessions actives : ${sessions.openCount()}/${cfg.MAX_SESSIONS}\n` +
    `📢 Mode : ${ctx.store.data.mode}\n🤖 Version : ${cfg.VERSION}`);
} });
