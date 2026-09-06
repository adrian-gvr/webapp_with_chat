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
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import SiteSettings from "./models/SiteSettings.js";

import mongoose from "mongoose";

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas connesso"))
    .catch((err) => console.error("❌ Errore connessione MongoDB:", err));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret";

const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// INIZIO

import http from "http";
import { Server } from "socket.io";

// CREA SERVER HTTP
const server = http.createServer(app);

// CREA SERVER SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://webapp-with-chat-1.onrender.com",
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

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api/auth", authRoutes);

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

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).lean();
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenziali errate" });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

app.get("/api/settings", async (req, res) => {
  const settings = await SiteSettings.findOne({ key: "site" }).lean();
  res.json(settings || {});
});

app.put("/api/settings", auth, async (req, res) => {
  const settings = await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set: { key: "site", ...req.body } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  res.json({ success: true });
});

app.get("/api/profile", auth, async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).lean();
  if (!user) return res.status(404).json({ error: "Utente non trovato" });
  res.json({ id: user.id, username: user.username, email: user.email });
});

// POSTS
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ date: -1 }).lean();
  res.json(posts);
});

app.get("/api/posts/:id", async (req, res) => {
  const post = await Post.findOne({ id: req.params.id }).lean();
  if (!post) return res.status(404).json({ error: "Post non trovato" });
  res.json(post);
});

app.post("/api/posts", auth, upload.array("media", 5), async (req, res) => {
  const { title, content, type, tags } = req.body;

  console.log("🔧 BACKEND - Tags ricevuti:", tags); // <-- AGGIUNGI

  const mediaUrls = req.files
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];
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

  const savedPost = await Post.create(newPost);
  res.json(savedPost);
});

app.put("/api/posts/:id", auth, upload.array("media", 5), async (req, res) => {
  const { title, content, type, published, replaceMedia } = req.body;
  const post = await Post.findOne({ id: req.params.id });
  if (!post) return res.status(404).json({ error: "Post non trovato" });

  const newMediaUrls = req.files
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];
  const replace = replaceMedia === "true";

  post.title = title || post.title;
  post.content = content !== undefined ? content : post.content;
  post.type = type || post.type;
  post.published = published !== undefined ? published : post.published;
  post.mediaUrls = replace
    ? newMediaUrls
    : [...(post.mediaUrls || []), ...newMediaUrls];
  await post.save();
  res.json(post);
});

app.delete("/api/posts/:id", auth, async (req, res) => {
  await Post.deleteOne({ id: req.params.id });
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
app.get("/api/posts/:postId/comments", async (req, res) => {
  const comments = await Comment.find({
    post_id: req.params.postId,
    status: "approved",
  })
    .sort({ created_at: -1 })
    .lean();
  res.json(comments);
});

// POST nuovo commento
app.post("/api/posts/:postId/comments", async (req, res) => {
  const { author_name, author_email, content } = req.body;
  const { postId } = req.params;

  if (!author_name || !content) {
    return res.status(400).json({ error: "Nome e commento sono obbligatori" });
  }

  const newComment = {
    id: Date.now().toString(),
    post_id: postId,
    author_name: author_name,
    author_email: author_email || null,
    content: content,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  await Comment.create(newComment);
  res.json({
    success: true,
    message: "Commento inviato, in attesa di approvazione",
  });
});

// GET commenti in attesa (solo admin)
app.get("/api/admin/comments/pending", auth, async (req, res) => {
  const pending = await Comment.find({ status: "pending" })
    .sort({ created_at: -1 })
    .lean();
  res.json(pending);
});

// APPROVA commento
app.put("/api/admin/comments/:id/approve", auth, async (req, res) => {
  await Comment.updateOne(
    { id: req.params.id },
    { $set: { status: "approved" } },
  );
  res.json({ success: true });
});

// ELIMINA commento
app.put("/api/admin/comments/:id/reject", auth, async (req, res) => {
  await Comment.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
