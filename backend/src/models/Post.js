import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  type: { type: String, default: "image" },
  tags: { type: [String], default: [] },
  mediaUrls: { type: [String], default: [] },
  date: { type: String, required: true },
  published: { type: Boolean, default: true },
});

export default mongoose.model("Post", PostSchema);
