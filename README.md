# Portfolio creativo con blog

Applicazione React/Vite con API Express, blog, dashboard amministrativa,
commenti moderati, contatti e chat in tempo reale. Post, impostazioni, commenti,
contatti e file multimediali sono salvati in MongoDB Atlas; i file sono
archiviati in GridFS, così non dipendono dal disco temporaneo dell'host.

## Avvio in locale

Serve Node.js 20 o successivo.

1. Copiare `backend/.env.example` in `backend/.env` e inserire `MONGO_URI` e un
   `JWT_SECRET` casuale.
2. Impostare `ADMIN_USERNAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` nel file `.env`.
   La password deve avere almeno 12 caratteri.
3. In `backend` eseguire `npm ci`, poi `npm run admin:create` per creare o
   aggiornare l'account amministratore nel database.
4. Avviare il server con `npm run dev`.
5. In un secondo terminale, entrare in `frontend`, eseguire `npm ci` e
   `npm run dev`.

Aprire <http://localhost:5175>. Vite inoltra API, file e Socket.IO al backend
sulla porta 5001. Per cambiare la porta del backend, impostare `PORT` e
`API_PORT` con lo stesso valore.

Per importare una volta i dati dei vecchi file JSON, configurare `MONGO_URI` e
`PUBLIC_BACKEND_URL` e lanciare `npm run migrate:json-to-mongo` in `backend`.
La migrazione importa anche i file in GridFS; conservare i JSON locali finché
non si è verificato che l'importazione sia riuscita.

## Pubblicazione gratuita

Il progetto usa GitHub Pages per il frontend e un servizio web Render per l'API;
MongoDB Atlas ospita il database.

### Backend su Render

Creare un Web Service collegato al repository con:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Piano: `Free`
- Health check path: `/healthz`

Impostare le variabili d'ambiente `MONGO_URI`, `JWT_SECRET`,
`FRONTEND_URL=https://adrian-gvr.github.io` e `NODE_ENV=production`. Render
fornisce `PORT` e `RENDER_EXTERNAL_URL` automaticamente. Atlas deve consentire
la connessione dal servizio Render.

Creare l'account amministratore dal proprio computer con gli stessi valori
`MONGO_URI`, `ADMIN_USERNAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` del servizio, poi
eseguire `npm run admin:create` in `backend`. La registrazione pubblica è
disabilitata.

### Frontend su GitHub Pages

Il workflow `.github/workflows/deploy-pages.yml` compila e pubblica il frontend
su ogni push a `main`. In GitHub, impostare Pages sulla sorgente **GitHub
Actions**. Il workflow punta all'API `https://webapp-with-chat.onrender.com`;
se l'URL del servizio Render è diverso, aggiornare `VITE_API_URL` nel workflow.

Non inserire segreti o dati del database nel repository. Le variabili con
prefisso `VITE_` sono incluse nel JavaScript pubblico e non devono contenere
credenziali.
