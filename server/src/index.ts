import express from 'express';
import cors from 'cors';
import { initDB, client } from './db.ts';
import { apiConfig } from './config.ts';
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken } from './auth.ts';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors({ origin: 'http://localhost:3002', credentials: true }));
app.use(express.json());

// Signup logic adapted for immudb
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  
  try {
    await client.executeSQL(
      `INSERT INTO users (id, email, hashedPassword, createdAt) VALUES (?, ?, ?, NOW())`,
      [id, email, hashedPassword]
    );
    res.status(201).json({ id, email });
  } catch (err: any) {
    res.status(400).json({ error: "User already exists or DB error" });
  }
});

// Login logic using JWT/Refresh Token pattern
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const result = await client.querySQL(`SELECT id, hashedPassword FROM users WHERE email = ?`, [email]);
  if (!result || result.length === 0) return res.status(401).send("Invalid credentials");

  const user = result[0];
  const isMatch = await checkPasswordHash(password, user.hashedPassword as string);
  
  if (!isMatch) return res.status(401).send("Invalid credentials");

  const token = makeJWT(user.id as string, 3600); // 1 hour
  const refreshToken = makeRefreshToken();

  // Store refresh token in immudb
  await client.executeSQL(
    `INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ? )`,
    [refreshToken, user.id, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()]
  );

  res.json({ token, refreshToken });
});

const start = async () => {
  await initDB();
  app.listen(3000, () => console.log("🚀 Server running on port 3000"));
};

start();
