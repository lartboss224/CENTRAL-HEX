const { add } = require('../core/registry');
const { pick } = require('../lib/util');
const { QUIZ } = require('../lib/helpers');

add({ name: 'quizz', cat: 'search', desc: 'quiz', async run(ctx) {
  const [q, opts, ans] = pick(QUIZ);
  const L = ['a', 'b', 'c', 'd'];
  ctx.startQuiz({ answer: L[ans], label: opts[ans], until: Date.now() + 45000 });
  await ctx.reply(`🧠 *QUIZ*\n\n${q}\n\n${opts.map((o, i) => `*${L[i].toUpperCase()}.* ${o}`).join('\n')}\n\n_Réponds par A, B, C ou D (45 s)._`);
} });
