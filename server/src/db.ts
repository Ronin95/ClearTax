import { Pool } from 'pg';
import { apiConfig } from './config.ts';

export const pool = new Pool(apiConfig.db);

export async function initDB() {
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL");

        // 1. Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username VARCHAR(256),
                email VARCHAR(256) UNIQUE,
                image_id VARCHAR(256) NULL,
                hashed_password VARCHAR(256),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Refresh Tokens Table (Missing in your original initDB but used in login)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                token TEXT PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                expires_at TIMESTAMP
            );
        `);

        // 3. Categories Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS funding_categories (
                id INTEGER PRIMARY KEY,
                name VARCHAR(64)
            );
        `);

        const categories = [
            [1, 'Infrastructure'],
            [2, 'Technology'],
            [3, 'Transportation']
        ];

        for (const [id, name] of categories) {
            await pool.query(`
                INSERT INTO funding_categories (id, name) 
                VALUES ($1, $2) 
                ON CONFLICT (id) DO NOTHING;
            `, [id, name]);
        }

        // 4. Contributions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contributions (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                category_id INTEGER REFERENCES funding_categories(id),
                amount DECIMAL(12, 2), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 5. Open Problems Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS open_problems (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                category_id INTEGER REFERENCES funding_categories(id),
                todo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        client.release();
        console.log("✅ PostgreSQL Tables Initialized");
    } catch (err) {
        console.error("❌ DB Initialization failed:", err);
        process.exit(1);
    }
}
