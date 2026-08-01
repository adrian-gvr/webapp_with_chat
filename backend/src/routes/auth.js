// routes/auth.js

import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// REGISTRAZIONE UTENTE
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
    });

    res.json({ message: "Utente creato", user });
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
