import dotenv from "dotenv";
dotenv.config();

// console.log("DEBUG ENV:", process.env);
// console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);

import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connesso"))
  .catch((err) => console.error("❌ Errore connessione MongoDB:", err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const DATA_FILE = path.join(__dirname, "../database.json");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// INIZIO

import http from "http";
import { Server } from "socket.io";

// CREA SERVER HTTP
const server = http.createServer(app);

// CREA SERVER SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "https://webapp-with-chat-1.onrender.com",
    methods: ["GET", "POST"],
  },
});

// EVENTI SOCKET.IO
io.on("connection", (socket) => {
  console.log("🔌 Nuovo client connesso:", socket.id);

  socket.on("registerUser", (username) => {
    socket.username = username;
    updateUsersOnline();
  });

  socket.on("chatMessage", (text) => {
    const msg = {
      id: socket.id,
      user: socket.username || "Anonimo",
      text,
      timestamp: Date.now(),
    };
    io.emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    updateUsersOnline();
    console.log("❌ Client disconnesso:", socket.id);
  });
});

// FINE

function updateUsersOnline() {
  const users = [];

  for (const [id, socket] of io.of("/").sockets) {
    if (socket.username) {
      users.push(socket.username);
    }
  }

  io.emit("usersOnline", users);
}

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
      comments: [],
      settings: {
        site_name: "Il Mio Portfolio Creativo",
        bio: "Sono un creativo digitale appassionato di fotografia, videoarte e graphic design.",
        contact_email: "info@miosito.it",
        gdpr_text: "Questo sito rispetta il GDPR 2026.",
      },
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialDB, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/", (req, res) => {
  res.send("Backend attivo su Render 🚀");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

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

app.post("/api/login", (req, res) => {
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

app.get("/api/settings", (req, res) => {
  const db = getDB();
  res.json(db.settings);
});

app.put("/api/settings", auth, (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true });
});

app.get("/api/profile", auth, (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === req.user.id);
  res.json({ id: user.id, username: user.username, email: user.email });
});

// POSTS
app.get("/api/posts", (req, res) => {
  const db = getDB();
  res.json(db.posts);
});

app.get("/api/posts/:id", (req, res) => {
  const db = getDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post non trovato" });
  res.json(post);
});

app.post("/api/posts", auth, upload.array("media", 5), (req, res) => {
  const { title, content, type, tags } = req.body;

  console.log("🔧 BACKEND - Tags ricevuti:", tags); // <-- AGGIUNGI

  const mediaUrls = req.files
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];
  const db = getDB();

  // Converte i tags da stringa a array
  const tagsArray = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t)
    : [];

  console.log("🔧 BACKEND - Tags convertiti:", tagsArray); // <-- AGGIUNGI

  const newPost = {
    id: uuidv4(),
    title,
    content: content || "",
    type: type || "image",
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    mediaUrls: mediaUrls,
    date: new Date().toISOString(),
    published: true,
  };

  console.log("🔧 BACKEND - Nuovo post creato:", newPost); // <-- AGGIUNGI

  db.posts.push(newPost);
  saveDB(db);
  res.json(newPost);
});

app.put("/api/posts/:id", auth, upload.array("media", 5), (req, res) => {
  const { title, content, type, published, replaceMedia } = req.body;
  const db = getDB();
  const index = db.posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post non trovato" });

  const newMediaUrls = req.files
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];
  const replace = replaceMedia === "true";

  db.posts[index] = {
    ...db.posts[index],
    title: title || db.posts[index].title,
    content: content !== undefined ? content : db.posts[index].content,
    type: type || db.posts[index].type,
    published: published !== undefined ? published : db.posts[index].published,
    mediaUrls: replace
      ? newMediaUrls
      : [...(db.posts[index].mediaUrls || []), ...newMediaUrls],
  };
  saveDB(db);
  res.json(db.posts[index]);
});

app.delete("/api/posts/:id", auth, (req, res) => {
  const db = getDB();
  db.posts = db.posts.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// CONTATTI
app.post("/api/contacts", (req, res) => {
  const { name, email, message } = req.body;
  console.log(`📧 Messaggio da ${name} (${email}): ${message}`);
  res.json({ success: true });
});

// GDPR
app.post("/api/gdpr/consent", (req, res) => {
  console.log(`Consenso GDPR da ${req.ip}`);
  res.json({ success: true });
});

app.get("/api/gdpr/export", auth, (req, res) => {
  res.json({ user: req.user, exportDate: new Date().toISOString() });
});

app.delete("/api/gdpr/data", auth, (req, res) => {
  res.json({ success: true, message: "Richiesta ricevuta" });
});

// ========== COMMENTI ==========

// GET commenti approvati per un post
app.get("/api/posts/:postId/comments", (req, res) => {
  const db = getDB();
  if (!db.comments) db.comments = [];
  const comments = db.comments
    .filter((c) => c.post_id === req.params.postId && c.status === "approved")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(comments);
});

// POST nuovo commento
app.post("/api/posts/:postId/comments", (req, res) => {
  const { author_name, author_email, content } = req.body;
  const { postId } = req.params;

  if (!author_name || !content) {
    return res.status(400).json({ error: "Nome e commento sono obbligatori" });
  }

  const db = getDB();

  if (!db.comments) db.comments = [];

  const newComment = {
    id: Date.now().toString(),
    post_id: postId,
    author_name: author_name,
    author_email: author_email || null,
    content: content,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  // Assicurati che db.comments esista
  if (!db.comments) db.comments = [];

  db.comments.push(newComment);
  saveDB(db);
  res.json({
    success: true,
    message: "Commento inviato, in attesa di approvazione",
  });
});

// GET commenti in attesa (solo admin)
app.get("/api/admin/comments/pending", auth, (req, res) => {
  const db = getDB();
  const pending = (db.comments || [])
    .filter((c) => c.status === "pending")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(pending);
});

// APPROVA commento
app.put("/api/admin/comments/:id/approve", auth, (req, res) => {
  const db = getDB();
  const comment = db.comments.find((c) => c.id === req.params.id);
  if (comment) {
    comment.status = "approved";
    saveDB(db);
  }
  res.json({ success: true });
});

// ELIMINA commento
app.put("/api/admin/comments/:id/reject", auth, (req, res) => {
  const db = getDB();
  db.comments = db.comments.filter((c) => c.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
