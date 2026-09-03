# Creative Portfolio Blog

Blog React/Vite con API Express, gestione post multimediali, commenti moderati,
login amministratore e chat Socket.IO.

## Avvio locale

Sono necessari Node.js 20 o superiore.

```powershell
cd backend
npm install
npm start
```

In un secondo terminale:

```powershell
cd frontend
npm install
npm run dev
```

Aprire <http://localhost:5175>. Il frontend inoltra automaticamente API,
upload e WebSocket al backend sulla porta 5001.

## Configurazione

Il backend funziona in locale con il database JSON incluso. Per la produzione
impostare `PORT`, `JWT_SECRET` e, se necessario, `MONGO_URI` in un file
`.env` non tracciato da Git.

Se frontend e backend sono servizi Render separati, impostare nel frontend
la variabile `VITE_API_URL=https://webapp-with-chat.onrender.com` e usare
`npm run build` con directory pubblicata `dist`.
Nel backend impostare anche `FRONTEND_URL` con l'URL pubblico del frontend.

Credenziali demo amministratore: `admin` / `admin123`.
