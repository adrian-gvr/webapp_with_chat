import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import User from "./src/models/User.js";
import SiteSettings from "./src/models/SiteSettings.js";

const { MONGO_URI, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGO_URI || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "Configura MONGO_URI, ADMIN_USERNAME, ADMIN_EMAIL e ADMIN_PASSWORD prima di creare l'admin.",
  );
}

if (ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD deve contenere almeno 12 caratteri.");
}

try {
  await mongoose.connect(MONGO_URI);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    {
      $set: {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: "admin",
      },
      $setOnInsert: { id: uuidv4() },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    {
      $setOnInsert: {
        site_name: process.env.SITE_NAME || "Il Mio Portfolio Creativo",
        bio:
          process.env.SITE_BIO ||
          "Portfolio creativo di fotografia, videoarte e graphic design.",
        contact_email: process.env.SITE_CONTACT_EMAIL || "",
        gdpr_text:
          process.env.GDPR_TEXT ||
          "Questo sito tratta i dati personali secondo la normativa applicabile.",
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  console.log(`Account amministratore "${ADMIN_USERNAME}" pronto in MongoDB.`);
} finally {
  await mongoose.disconnect();
}
