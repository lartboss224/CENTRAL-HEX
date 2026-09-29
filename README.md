# CENTRAL-HEX — bot WhatsApp multi-session (sans préfixe)

Créé par **IB-SACKO & SALGA** · Propriétaire : **SALGADO**

## Fonctionnement
- Le site (`/`) demande un numéro → génère un **code pair** (ou un **QR**) → le bot se connecte tout seul.
- Chaque numéro = une session indépendante (`sessions/<numéro>`), reconnexion automatique, restauration au redémarrage.
- Aucun préfixe : écrire `menu`, `ping`, `sticker`…
- Panneau admin : `/admin` (mot de passe = variable `ADMIN_PASSWORD`, défaut `CENTRALHEX@` → **change-le en production**).

## Structure
- `commands/` : **un fichier par commande** (`menu.js`, `ping.js`, `kick.js`…), chargées automatiquement.
  Pour ajouter une commande : crée un fichier `commands/macommande.js` (copie `ping.js` comme modèle),
  puis ajoute-la dans `core/menu.js` pour qu'elle apparaisse dans le menu.
- `core/` : sessions WhatsApp, handler de messages, protections, menu.
- `lib/` : outils partagés (`helpers.js`, `util.js`, `media.js`).
- `public/` : `index.html` (site) et `admin.html` (panneau admin).

## Lancer en local
```
npm install
node server.js        # http://localhost:3000
```

## Déployer (Render / Railway / Koyeb — via Dockerfile)
1. Pousse le dossier sur GitHub, crée un service **Web** à partir du Dockerfile.
2. Variables : `ADMIN_PASSWORD`, `MAX_SESSIONS` (voir RAM ci-dessous), `PUBLIC_URL` (l'URL du site, pour le keep-alive).
3. **Ajoute un volume persistant** monté sur `/app/sessions` et `/app/data`, sinon les sessions sont perdues à chaque redéploiement.
4. Le lien du service = le lien à partager à tes utilisateurs.

## Capacité (important)
Chaque numéro connecté consomme environ 40 à 80 Mo de RAM. Repères : 25 sessions ≈ 2 Go, 60 ≈ 4 Go, 150 ≈ 8 à 10 Go.
Règle `MAX_SESSIONS` selon l'hébergement : au-delà de la RAM disponible, le serveur plante et déconnecte tout le monde.
 
