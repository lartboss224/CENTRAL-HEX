// Registre des commandes : chaque commande = { name, cat, desc, ... , run(ctx) }
const cmds = new Map();
const cats = [];

function add(def) {
  cmds.set(def.name, def);
  if (!cats.includes(def.cat)) cats.push(def.cat);
}
const get = name => cmds.get(name);
const all = () => [...cmds.values()];
const total = () => cmds.size;
module.exports = { add, get, all, total, cats };
