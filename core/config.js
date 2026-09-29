require('dotenv').config();
module.exports = {
  BOT_NAME: 'CENTRAL-HEX',
  VERSION: '1.0.0',
  PORT: Number(process.env.PORT) || 3000,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'CENTRALHEX@',
  MAX_SESSIONS: Number(process.env.MAX_SESSIONS) || 150,
  PUBLIC_URL: process.env.PUBLIC_URL || '',
  MENU_IMAGE: 'https://i.ibb.co/sp9NG70Y/WA-1790641037187.jpg',
  OWNER: { name: 'SALGADO', number: '224662675862' },
  CREATORS: [
    { name: 'IB-SACKO', number: '224621963059' },
    { name: 'SALGA', number: '224621963059' }
  ],
  // Numéros toujours considérés comme propriétaires du système
  SUDO: ['224662675862', '224621963059']
};
