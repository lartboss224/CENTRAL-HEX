const { add } = require('../core/registry');
const { viewOnce } = require('../lib/helpers');

add({ name: 'waouh', cat: 'editing', desc: 'capturer un média vue unique', run: ctx => viewOnce(ctx, false) });
