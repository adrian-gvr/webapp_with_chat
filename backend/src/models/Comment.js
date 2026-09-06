import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  post_id: { type: String, required: true },
  author_name: { type: String, required: true },
  author_email: { type: String, default: null },
  content: { type: String, required: true },
  status: { type: String, default: "pending" },
  created_at: { type: String, required: true },
});

export default mongoose.model("Comment", CommentSchema);
