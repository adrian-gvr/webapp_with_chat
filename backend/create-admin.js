import bcrypt from 'bcryptjs';
import fs from 'fs';

const hashedPassword = bcrypt.hashSync('admin123', 10);

const db = {
  users: [
    {
      id: "1",
      username: "admin",
      password: hashedPassword,
      email: "admin@test.com",
      role: "admin"
    }
  ],
  posts: [],
  settings: {
    site_name: "Il Mio Portfolio Creativo",
    bio: "Sono un creativo digitale appassionato di fotografia, videoarte e graphic design.",
    contact_email: "info@miosito.it",
    gdpr_text: "Questo sito rispetta il GDPR 2026."
  }
};

fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
console.log('✅ Admin creato con successo!');
console.log('Username: admin');
console.log('Password: admin123');