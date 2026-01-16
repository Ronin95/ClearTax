import express from 'express';
import cors from 'cors';
import { initDB, pool } from './db.ts';
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken } from './auth.ts';
import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
});

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { email, password, username } = req.body;
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  
  try {
    await pool.query(
    `INSERT INTO users (id, username, email, hashed_password) VALUES ($1, $2, $3, $4)`,
      [id, username || email.split('@')[0], email, hashedPassword]
    );
    res.status(201).json({ id, email });
  } catch (err: any) {
    res.status(400).json({ error: "User already exists or DB error" });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, hashed_password FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) {
        return res.status(401).send("Invalid credentials");
    }

    const user = result.rows[0];
    const isMatch = await checkPasswordHash(password, user.hashedPassword);
    
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = makeJWT(user.id, 3600);
    const refreshToken = makeRefreshToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await pool.query(
      `INSERT INTO refresh_tokens (token, "userId", "expiresAt") VALUES ($1, $2, $3)`,
      [refreshToken, user.id, expiresAt]
    );

    res.json({ token, refreshToken });
  } catch (err) {
    res.status(500).send("Server error during login");
  }
});

app.get('/api/landingPage/contributions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.username, fc.name as category, c.amount, c.created_at
            FROM contributions c 
            JOIN users u ON c.user_id = u.id 
            JOIN funding_categories fc ON c.category_id = fc.id
            ORDER BY c.created_at DESC LIMIT 1000;
        `);

        const simplifiedData = result.rows.map((row: any) => ({
            username: row.username || "Unknown",
            category: row.category || "General",
            amount: parseFloat(row.amount).toFixed(2),
            createdAt: row.created_at
        }));

        res.json(simplifiedData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/landingPage/pieChart', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                fc.id, 
                fc.name AS label, 
                COUNT(c.id)::int AS value
            FROM funding_categories fc
            LEFT JOIN contributions c ON fc.id = c.category_id
            GROUP BY fc.id, fc.name
            ORDER BY fc.id ASC;
        `);
        res.json(result.rows);
    } catch (error: any) {
        console.error("❌ PieChart API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const start = async () => {
  await initDB();
  app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 Server running on http://0.0.0.0:3000");
  });
};

start();
