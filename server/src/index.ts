import express from 'express';
import cors from 'cors';
import { initDB, client } from './db.ts';
import { apiConfig } from './config.ts';
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

interface ContributionData {
    username: string;
    imageId: string;
    category: string;
    amount: number;
    createdAt: string | number;
}

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Signup logic
app.post('/api/signup', async (req, res) => {
  const { email, password, username } = req.body; // Added username
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  
  try {
    // Corrected method to SQLExec and added username column
    await client.SQLExec({
      sql: `INSERT INTO users (id, username, email, hashedPassword, createdAt) 
            VALUES ('${id}', '${username || email.split('@')[0]}', '${email}', '${hashedPassword}', NOW())`
    });
    res.status(201).json({ id, email });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(400).json({ error: "User already exists or DB error" });
  }
});

// Login logic
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Corrected to SQLQuery
    const result = await client.SQLQuery({
      sql: `SELECT id, hashedPassword FROM users WHERE email = '${email}'`
    });

    // immudb checks: result.rows is the array
    if (!result || !result.rows || result.rows.length === 0) {
        return res.status(401).send("Invalid credentials");
    }

    // Access values correctly (.s for string)
    const userId = result.rows[0].values[0].s;
    const dbHashedPassword = result.rows[0].values[1].s;

    const isMatch = await checkPasswordHash(password, dbHashedPassword);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = makeJWT(userId, 3600);
    const refreshToken = makeRefreshToken();

    // Store refresh token
    await client.SQLExec({
      sql: `INSERT INTO refresh_tokens (token, userId, expiresAt) 
            VALUES ('${refreshToken}', '${userId}', '${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()}')`
    });

    res.json({ token, refreshToken });
  } catch (err) {
    res.status(500).send("Server error during login");
  }
});

app.get('/api/contributions/recent', async (req, res) => {
    try {
        const result = await client.SQLQuery({
            sql: `SELECT u.username, u.imageId, fc.name as category, c.amount, c.createdAt 
                  FROM contributions c 
                  JOIN users u ON c.userId = u.id 
                  JOIN funding_categories fc ON c.categoryId = fc.id
                  ORDER BY c.createdAt DESC LIMIT 145;`
        });

        const rows = Array.isArray(result) ? result : (result?.rows || []);

        const dataWithSecureLinks = await Promise.all(rows.map(async (row: any) => {
            // FIX 1: Access values using lowercase keys as returned by immudb
            const username = row.username || row.values?.[0]?.s;
            const imageId  = row.imageid  || row.imageId || row.values?.[1]?.s; // imageid is lowercase in your logs
            const category = row.category || row.values?.[2]?.s;
            
            // FIX 2: Correct amount extraction (check lowercase 'amount')
            const rawAmount = row.amount !== undefined ? row.amount : (row.values?.[3]?.d || row.values?.[3]?.n || 0);
            const amountFormatted = parseFloat(rawAmount.toString()).toFixed(2);

            let presignedUrl = "";
            if (imageId && imageId !== "undefined") {
                try {
                    // Generate using 'minio' endpoint for internal communication
                    const rawUrl = await minioClient.presignedGetObject(
                        'cleartax-images', 
                        `${imageId}.png`, 
                        3600
                    );
                    
                    // FIX 3: Browser Networking - replace 'minio' with 'localhost'
                    // Your Windows browser cannot resolve the container name 'minio'
                    presignedUrl = rawUrl.replace('minio:9000', 'localhost:9000');
                } catch (e) {
                    console.error(`MinIO link generation failed for ${imageId}:`, e);
                }
            }

            return {
                username: username || "Unknown",
                category: category || "General",
                amount: amountFormatted,
                imageUrl: presignedUrl
            };
        }));

        res.json(dataWithSecureLinks);
    } catch (error: any) {
        console.error("❌ API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const start = async () => {
  await initDB();
  app.listen(3000, () => console.log("🚀 Server running on port 3000"));
};

start();
