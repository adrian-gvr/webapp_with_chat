import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  legacyId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  ip: { type: String, default: "" },
});

export default mongoose.model("Contact", ContactSchema);
