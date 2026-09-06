import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import SiteSettings from "./models/SiteSettings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../database.json");

const data = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));

await mongoose.connect(process.env.MONGO_URI);

for (const user of data.users || []) {
  await User.updateOne({ id: user.id }, { $set: user }, { upsert: true });
}

for (const post of data.posts || []) {
  await Post.updateOne({ id: post.id }, { $set: post }, { upsert: true });
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

console.log("Migrazione completata da database.json a MongoDB.");
await mongoose.disconnect();
