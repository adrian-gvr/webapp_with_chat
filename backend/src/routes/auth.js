// routes/auth.js

import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";

const router = express.Router();

// REGISTRAZIONE UTENTE
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: uuidv4(),
      username: username || email.split("@")[0],
      email,
      password: hashed,
    });

    res.json({
      message: "Utente creato",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// // REGISTRAZIONE
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       email,
//       password: hashed,
//     });

//     res.json({ message: "Utente creato", user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
