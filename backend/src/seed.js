import bcrypt from "bcrypt";
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../../blog.db");

async function seed() {
  console.log("🌱 Inizializzazione seed...");

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  let db;
  let dbBuffer = null;

  if (fs.existsSync(DB_PATH)) {
    dbBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(dbBuffer);
  } else {
    db = new SQL.Database();
  }

  // Crea tabelle se non esistono
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL,
    media_url TEXT,
    thumbnail_url TEXT,
    published_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_published INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS consent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT,
    consent_given INTEGER DEFAULT 0,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
  )`);

  // Controlla se esiste già un utente admin
  const checkUser = db.exec("SELECT COUNT(*) as count FROM users");
  let userExists = false;

  if (checkUser.length > 0) {
    const count = checkUser[0].values[0][0];
    userExists = count > 0;
  }

  if (!userExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    db.run(
      `
      INSERT INTO users (username, password, email, role, created_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      ["admin", hashedPassword, "admin@example.com", "admin"],
    );
    console.log("✅ Admin user creato: admin / admin123");
  } else {
    console.log("ℹ️ Admin user già esistente");
  }

  // Controlla se esistono post
  const checkPosts = db.exec("SELECT COUNT(*) as count FROM blog_posts");
  let postsExist = false;

  if (checkPosts.length > 0) {
    const count = checkPosts[0].values[0][0];
    postsExist = count > 0;
  }

  if (!postsExist) {
    const samplePosts = [
      {
        title: "Benvenuti nel mio portfolio creativo!",
        content:
          "Ciao! Sono felice di condividere con voi il mio spazio creativo. Qui troverete i miei migliori lavori nel campo della fotografia, videoarte e graphic design. Restate sintonizzati per nuovi contenuti!",
        type: "image",
        media_url: null,
      },
      {
        title: "Nuovo progetto: Identità visiva per startup tech",
        content:
          "Ho appena completato un progetto emozionante: l'identità visiva completa per una startup innovativa nel settore dell'AI. Ecco alcuni degli elementi principali del progetto...",
        type: "graphic",
        media_url: null,
      },
      {
        title: "Backstage del mio ultimo shooting fotografico",
        content:
          "Ecco un video dietro le quinte del mio ultimo shooting fotografico. Un progetto che mi ha visto impegnato per tre giorni in uno studio professionale a Milano.",
        type: "video",
        media_url: null,
      },
    ];

    for (const post of samplePosts) {
      db.run(
        `
        INSERT INTO blog_posts (title, content, type, media_url, published_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [post.title, post.content, post.type, post.media_url],
      );
    }
    console.log("✅ Post di esempio creati");
  } else {
    console.log("ℹ️ Post già esistenti");
  }

  // Impostazioni di default
  const defaultSettings = [
    { key: "site_name", value: "Il Mio Portfolio Creativo" },
    {
      key: "bio_text",
      value:
        "Sono un creativo digitale appassionato di design, fotografia e arte visiva. Benvenuto nel mio mondo!",
    },
    { key: "contact_email", value: "info@miosito.it" },
    {
      key: "gdpr_notice",
      value:
        "Questo sito utilizza cookie tecnici e memorizza i tuoi consensi come richiesto dal GDPR 2026. I tuoi dati sono al sicuro e non vengono venduti a terzi.",
    },
  ];

  for (const setting of defaultSettings) {
    const check = db.exec(
      `SELECT id FROM site_settings WHERE key = '${setting.key}'`,
    );
    if (check.length === 0 || check[0].values.length === 0) {
      db.run(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [setting.key, setting.value],
      );
    }
  }
  console.log("✅ Impostazioni di default configurate");

  // Salva il database
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  console.log("🎉 Seed completato con successo!");
  console.log(`💾 Database salvato in: ${DB_PATH}`);
}

seed().catch(console.error);
