import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import SiteSettings from "./models/SiteSettings.js";
import Contact from "./models/Contact.js";

import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI non configurata");
}

try {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("✅ MongoDB Atlas connesso");
} catch (err) {
  console.error("❌ Errore connessione MongoDB:", err.message);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non configurata");
}

const PUBLIC_BACKEND_URL = (
  process.env.PUBLIC_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || ""
).replace(/\/$/, "");

const frontendOrigins = new Set(
  [
    "https://adrian-gvr.github.io",
    "https://webapp-with-chat-1.onrender.com",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:10000",
    ...(process.env.FRONTEND_URL || "").split(","),
  ]
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

const allowFrontendOrigin = (origin, callback) => {
  callback(null, !origin || frontendOrigins.has(origin));
};

const corsOptions = {
  origin: allowFrontendOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// INIZIO

import http from "http";
import { Server } from "socket.io";

// CREA SERVER HTTP
const server = http.createServer(app);

// CREA SERVER SOCKET.IO
const io = new Server(server, {
  cors: corsOptions,
});

let gridFSBucket;

const getGridFSBucket = async () => {
  await mongoose.connection.asPromise();
  if (!gridFSBucket) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
  }
  return gridFSBucket;
};

// EVENTI SOCKET.IO
io.on("connection", (socket) => {
  console.log("🔌 Nuovo client connesso:", socket.id);

  socket.on("registerUser", (username) => {
    if (typeof username !== "string") return;
    const name = username.trim().slice(0, 32);
    if (!name) return;
    socket.username = name;
    updateUsersOnline();
  });

  socket.on("chatMessage", (text) => {
    if (typeof text !== "string") return;
    const messageText = text.trim().slice(0, 2000);
    if (!messageText) return;
    const msg = {
      id: socket.id,
      user: socket.username || "Anonimo",
      text: messageText,
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

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/", (req, res) => {
  res.send("Backend attivo su Render 🚀");
});

app.get("/healthz", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "database_unavailable",
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const uploadUrl = (id) => `${PUBLIC_BACKEND_URL}/api/uploads/${id}`;

const saveUpload = async (file) => {
  const bucket = await getGridFSBucket();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { size: file.size },
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(uploadUrl(stream.id)));
    stream.end(file.buffer);
  });
};

app.get("/api/uploads/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = await getGridFSBucket();
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length)
      return res.status(404).json({ error: "File non trovato" });

    res.set("Content-Type", files[0].contentType || "application/octet-stream");
    bucket
      .openDownloadStream(fileId)
      .on("error", () => {
        if (!res.headersSent) res.status(404).end();
      })
      .pipe(res);
  } catch {
    res.status(400).json({ error: "ID file non valido" });
  }
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non autorizzato" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Permesso negato" });
    }
    next();
  } catch {
    res.status(401).json({ error: "Token non valido" });
  }
};

const optionalAdminAuth = (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      if (user.role === "admin") req.user = user;
    } catch {
      // Le richieste pubbliche continuano senza privilegi.
    }
  }
  next();
};

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {
      // fallback to comma-separated list
    }

    return raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

// ========== API ROUTES ==========

app.post("/api/login", asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Credenziali mancanti" });
  }

  const user = await User.findOne({ username }).lean();
  if (
    !user ||
    user.role !== "admin" ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({ error: "Credenziali errate" });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
}));

app.get("/api/settings", asyncRoute(async (_req, res) => {
  const settings = await SiteSettings.findOne({ key: "site" }).lean();
  res.json(settings || {});
}));

app.put("/api/settings", auth, asyncRoute(async (req, res) => {
  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set: { key: "site", ...req.body } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  res.json({ success: true });
}));

app.get("/api/profile", auth, asyncRoute(async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).lean();
  if (!user) return res.status(404).json({ error: "Utente non trovato" });
  res.json({ id: user.id, username: user.username, email: user.email });
}));

// POSTS
app.get("/api/posts", optionalAdminAuth, asyncRoute(async (req, res) => {
  const filter = req.user ? {} : { published: true };
  const posts = await Post.find(filter).sort({ date: -1 }).lean();
  res.json(posts);
}));

app.get("/api/posts/:id", optionalAdminAuth, asyncRoute(async (req, res) => {
  const filter = req.user
    ? { id: req.params.id }
    : { id: req.params.id, published: true };
  const post = await Post.findOne(filter).lean();
  if (!post) return res.status(404).json({ error: "Post non trovato" });
  res.json(post);
}));

app.post("/api/posts", auth, upload.array("media", 5), asyncRoute(async (req, res) => {
  const { title, content, type, tags } = req.body;
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Il titolo è obbligatorio" });
  }

  const mediaUrls = req.files
    ? await Promise.all(req.files.map((file) => saveUpload(file)))
    : [];
  const newPost = {
    id: uuidv4(),
    title: title.trim(),
    content: content || "",
    type: type || "image",
    tags: normalizeTags(tags),
    mediaUrls,
    date: new Date().toISOString(),
    published: true,
  };

  const savedPost = await Post.create(newPost);
  res.json(savedPost);
}));

app.put("/api/posts/:id", auth, upload.array("media", 5), asyncRoute(async (req, res) => {
  const { title, content, type, published, replaceMedia, tags } = req.body;
  const post = await Post.findOne({ id: req.params.id });
  if (!post) return res.status(404).json({ error: "Post non trovato" });

  const newMediaUrls = req.files
    ? await Promise.all(req.files.map((file) => saveUpload(file)))
    : [];
  const replace = replaceMedia === "true" || replaceMedia === true;

  post.title = title !== undefined ? String(title).trim() || post.title : post.title;
  post.content = content !== undefined ? content : post.content;
  post.type = type || post.type;
  if (published !== undefined) {
    post.published = published === true || published === "true";
  }
  post.tags = tags !== undefined ? normalizeTags(tags) : post.tags || [];
  post.mediaUrls = replace
    ? newMediaUrls
    : [...(post.mediaUrls || []), ...newMediaUrls];
  await post.save();
  res.json(post);
}));

app.delete("/api/posts/:id", auth, asyncRoute(async (req, res) => {
  await Post.deleteOne({ id: req.params.id });
  res.json({ success: true });
}));

// CONTATTI
app.post("/api/contacts", asyncRoute(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Nome, email e messaggio sono obbligatori" });
  }
  await Contact.create({ name, email, message, ip: req.ip });
  res.json({ success: true });
}));

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
app.get("/api/posts/:postId/comments", asyncRoute(async (req, res) => {
  const comments = await Comment.find({
    post_id: req.params.postId,
    status: "approved",
  })
    .sort({ created_at: -1 })
    .lean();
  res.json(comments);
}));

// POST nuovo commento
app.post("/api/posts/:postId/comments", asyncRoute(async (req, res) => {
  const { author_name, author_email, content } = req.body;
  const { postId } = req.params;

  if (
    typeof author_name !== "string" ||
    typeof content !== "string" ||
    !author_name.trim() ||
    !content.trim() ||
    author_name.trim().length > 100 ||
    content.trim().length > 5000
  ) {
    return res.status(400).json({ error: "Nome e commento sono obbligatori" });
  }

  const newComment = {
    id: uuidv4(),
    post_id: postId,
    author_name: author_name.trim(),
    author_email: typeof author_email === "string" ? author_email.trim() : null,
    content: content.trim(),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  await Comment.create(newComment);
  res.json({
    success: true,
    message: "Commento inviato, in attesa di approvazione",
  });
}));

// GET commenti in attesa (solo admin)
app.get("/api/admin/comments/pending", auth, asyncRoute(async (_req, res) => {
  const pending = await Comment.find({ status: "pending" })
    .sort({ created_at: -1 })
    .lean();
  res.json(pending);
}));

// APPROVA commento
app.put("/api/admin/comments/:id/approve", auth, asyncRoute(async (req, res) => {
  await Comment.updateOne(
    { id: req.params.id },
    { $set: { status: "approved" } },
  );
  res.json({ success: true });
}));

// ELIMINA commento
app.put("/api/admin/comments/:id/reject", auth, asyncRoute(async (req, res) => {
  await Comment.deleteOne({ id: req.params.id });
  res.json({ success: true });
}));

app.use((err, _req, res, _next) => {
  const status =
    err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT"
      ? 413
      : Number.isInteger(err.status) && err.status >= 400
        ? err.status
        : 500;
  if (status >= 500) console.error("Errore API:", err.message);
  res.status(status).json({
    error: status === 413 ? "File troppo grande" : "Errore durante la richiesta",
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
