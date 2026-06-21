import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

const app = express();
const PORT = 5000;
const JWT_SECRET = "my-super-secret-key-2026";

// Cartelle
const UPLOADS_DIR = path.join(__dirname, "uploads");
const DATA_FILE = path.join(__dirname, "database.json");

// Crea cartelle se non esistono
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Database su file JSON
function getDB() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialDB = {
      users: [
        {
          id: "1",
          username: "admin",
          password: bcrypt.hashSync("admin123", 10),
          email: "admin@test.com",
          role: "admin",
        },
      ],
      posts: [],
      settings: {
        site_name: "Il Mio Portfolio Creativo",
        bio: "Sono un creativo digitale appassionato di fotografia, videoarte e graphic design.",
        contact_email: "info@miosito.it",
        gdpr_text:
          "Questo sito rispetta il GDPR 2026. I tuoi dati sono al sicuro.",
      },
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialDB, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// Upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non autorizzato" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token non valido" });
  }
};

// ========== API ROUTES ==========

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  const user = db.users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenziali errate" });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

// GET impostazioni sito
app.get("/api/settings", (req, res) => {
  const db = getDB();
  res.json(db.settings);
});

// UPDATE impostazioni sito
app.put("/api/settings", auth, (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true });
});

// GET tutti i post del blog
app.get("/api/posts", (req, res) => {
  const db = getDB();
  res.json(db.posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// GET singolo post
app.get("/api/posts/:id", (req, res) => {
  const db = getDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post non trovato" });
  res.json(post);
});

// CREATE post
app.post("/api/posts", auth, upload.single("media"), (req, res) => {
  const { title, content, type } = req.body;
  const db = getDB();
  const newPost = {
    id: uuidv4(),
    title,
    content,
    type, // 'image', 'video', 'graphic'
    mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
    date: new Date().toISOString(),
    published: true,
  };
  db.posts.push(newPost);
  saveDB(db);
  res.json(newPost);
});

// UPDATE post
app.put("/api/posts/:id", auth, upload.single("media"), (req, res) => {
  const { title, content, type, published } = req.body;
  const db = getDB();
  const index = db.posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post non trovato" });

  db.posts[index] = {
    ...db.posts[index],
    title: title || db.posts[index].title,
    content: content || db.posts[index].content,
    type: type || db.posts[index].type,
    published: published !== undefined ? published : db.posts[index].published,
    mediaUrl: req.file
      ? `/uploads/${req.file.filename}`
      : db.posts[index].mediaUrl,
  };
  saveDB(db);
  res.json(db.posts[index]);
});

// DELETE post
app.delete("/api/posts/:id", auth, (req, res) => {
  const db = getDB();
  db.posts = db.posts.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// GET profilo
app.get("/api/profile", auth, (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === req.user.id);
  res.json({ id: user.id, username: user.username, email: user.email });
});

// GDPR - esporta dati
app.get("/api/gdpr/export", auth, (req, res) => {
  const db = getDB();
  const userPosts = db.posts.filter((p) => p.authorId === req.user.id);
  res.json({
    user: req.user,
    posts: userPosts,
    exportDate: new Date().toISOString(),
  });
});

// GDPR - richiedi cancellazione
app.delete("/api/gdpr/data", auth, (req, res) => {
  res.json({ success: true, message: "Richiesta di cancellazione ricevuta" });
});

// GDPR - consenso cookie
app.post("/api/gdpr/consent", (req, res) => {
  const { consent } = req.body;
  console.log(
    `Consenso GDPR: ${consent ? "Accettato" : "Rifiutato"} da ${req.ip}`,
  );
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`📁 Uploads: ${UPLOADS_DIR}`);
  console.log(`💾 Database: ${DATA_FILE}`);
  console.log(`🔐 Admin: admin / admin123`);
});
