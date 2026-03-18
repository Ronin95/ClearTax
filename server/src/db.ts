import { Pool } from 'pg';
import { apiConfig } from './config.ts';

export const pool = new Pool(apiConfig.db);

export async function initDB() {
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL");

        // Roles Table
        await pool.query(
            `CREATE TABLE IF NOT EXISTS user_roles (
                id INTEGER PRIMARY KEY,
                name VARCHAR(64) UNIQUE
            );
        `);

        const roles = [
            [1, 'regularUser'],
            [2, 'companyUser'],
            [3, 'admin']
        ];

        for (const [id, name] of roles) {
            await pool.query(`
                INSERT INTO user_roles (id, name) 
                VALUES ($1, $2) 
                ON CONFLICT (id) DO NOTHING;
            `, [id, name]);
        }

        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username VARCHAR(256),
                email VARCHAR(256) UNIQUE,
                hashed_password VARCHAR(256),
                role_id INTEGER REFERENCES user_roles(id) DEFAULT 1,
                company_name VARCHAR(256) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Refresh Tokens Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                token TEXT PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                expires_at TIMESTAMP
            );
        `);

        // Categories Table
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

        // Contributions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contributions (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                category_id INTEGER REFERENCES funding_categories(id),
                amount DECIMAL(12, 2), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Open Problems Table
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
