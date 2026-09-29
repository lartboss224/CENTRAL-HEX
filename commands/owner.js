const { add } = require('../core/registry');
const cfg = require('../core/config');

// Fiche de contact WhatsApp (boutons « Message » et « Ajouter un contact »)
const card = (name, number) => ({
  displayName: name,
  vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${cfg.BOT_NAME};\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`
});

add({ name: 'owner', cat: 'general', desc: 'infos propriétaire', async run(ctx) {
  const list = [
    card(`${cfg.CREATORS[0].name} & ${cfg.CREATORS[1].name} (Créateurs)`, cfg.CREATORS[0].number),
    card(`${cfg.OWNER.name} (Propriétaire)`, cfg.OWNER.number)
  ];
  for (const c of list) {
    await ctx.send({ contacts: { displayName: c.displayName, contacts: [c] } });
    await new Promise(r => setTimeout(r, 400));
  }
} });
