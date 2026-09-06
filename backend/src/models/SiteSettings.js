import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "site" },
  site_name: { type: String, default: "" },
  bio: { type: String, default: "" },
  contact_email: { type: String, default: "" },
  gdpr_text: { type: String, default: "" },
});

export default mongoose.model("SiteSettings", SiteSettingsSchema);
