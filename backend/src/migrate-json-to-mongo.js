import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import SiteSettings from "./models/SiteSettings.js";
import Contact from "./models/Contact.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../database.json");
const CONTACTS_FILE = path.join(__dirname, "../contacts.json");
const UPLOADS_DIR = path.join(__dirname, "../uploads");
const PUBLIC_BACKEND_URL = (
  process.env.PUBLIC_BACKEND_URL || "https://webapp-with-chat.onrender.com"
).replace(/\/$/, "");

const data = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
let contacts = [];
try {
  contacts = JSON.parse(await fs.readFile(CONTACTS_FILE, "utf8"));
} catch {
  // contacts.json is optional for new installations.
}

await mongoose.connect(process.env.MONGO_URI);

const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
  bucketName: "uploads",
});

const contentTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const migrateUpload = async (url) => {
  const filename = path.basename(new URL(url, "http://localhost").pathname);
  const sourcePath = path.join(UPLOADS_DIR, filename);
  try {
    const buffer = await fs.readFile(sourcePath);
    return await new Promise((resolve, reject) => {
      const stream = bucket.openUploadStream(filename, {
        contentType: contentTypes[path.extname(filename).toLowerCase()] || "application/octet-stream",
      });
      stream.on("error", reject);
      stream.on("finish", () =>
        resolve(`${PUBLIC_BACKEND_URL}/api/uploads/${stream.id}`),
      );
      stream.end(buffer);
    });
  } catch {
    return url;
  }
};

for (const user of data.users || []) {
  await User.updateOne(
    { $or: [{ id: user.id }, { username: user.username }] },
    { $set: user },
    { upsert: true },
  );
}

for (const post of data.posts || []) {
  await Post.updateOne({ id: post.id }, { $set: post }, { upsert: true });
}

for (const post of data.posts || []) {
  const mediaUrls = await Promise.all(
    (post.mediaUrls || []).map((url) => migrateUpload(url)),
  );
  if (mediaUrls.length) {
    await Post.updateOne({ id: post.id }, { $set: { mediaUrls } });
  }
}

for (const comment of data.comments || []) {
  await Comment.updateOne(
    { id: comment.id },
    { $set: comment },
    { upsert: true },
  );
}

await SiteSettings.findOneAndUpdate(
  { key: "site" },
  { $set: { key: "site", ...(data.settings || {}) } },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);

for (const contact of contacts) {
  await Contact.updateOne(
    { legacyId: contact.id },
    { $set: { ...contact, legacyId: contact.id } },
    { upsert: true },
  );
}

console.log("Migrazione completata da database.json a MongoDB.");
await mongoose.disconnect();
