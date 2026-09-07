import { Pool } from 'pg';
import { apiConfig } from './config.ts';

export const pool = new Pool(apiConfig.db);

export async function initDB() {
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_statuses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                color VARCHAR(20) NOT NULL DEFAULT 'default'
            );
        `);

        const defaultStatuses = [
            { name: 'Proposed', color: 'default' },
            { name: 'Funding Approved', color: 'info' },
            { name: 'In Progress', color: 'warning' },
            { name: 'Pending Completion', color: 'secondary' },
            { name: 'Completed', color: 'success' },
            { name: 'Funding Extension', color: 'warning' }
        ];

        for (const status of defaultStatuses) {
            await pool.query(`
                INSERT INTO project_statuses (name, color) 
                VALUES ($1, $2) 
                ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;
            `, [status.name, status.color]);
        }

        // Roles Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_roles (
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
                tax_number VARCHAR(9) UNIQUE,
                hashed_password VARCHAR(256),
                role_id INTEGER REFERENCES user_roles(id) DEFAULT 1,
                company_name VARCHAR(256) NULL,
                available_amount DECIMAL(12, 2) DEFAULT 0.00,
                contributed_amount DECIMAL(12, 2) DEFAULT 0.00,
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
            [3, 'Transportation'],
            [4, 'Debt Repayment']
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
                contributed_amount_by_user DECIMAL(12, 2), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Open Problems Table
                // Open Problems Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS open_problems (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                category_id INTEGER REFERENCES funding_categories(id),
                project_name VARCHAR(255),
                summar_desc TEXT,
                image_list TEXT[] DEFAULT '{}',
                file_list TEXT[] DEFAULT '{}',
                latitude DECIMAL(10, 6),
                longitude DECIMAL(10, 6),
                amount_raised DECIMAL(12, 2) DEFAULT 0.00,
                target_funding DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                creator_work BOOLEAN DEFAULT false,
                status VARCHAR(50) REFERENCES project_statuses(name),
                assigned_company_id UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_bids (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES open_problems(id) ON DELETE CASCADE,
                company_id UUID REFERENCES users(id) ON DELETE CASCADE,
                estimated_cost DECIMAL(12, 2) NOT NULL,
                estimated_start_date DATE,
                estimated_end_date DATE,
                pitch TEXT NOT NULL,
                file_list TEXT[] DEFAULT '{}',
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_updates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES open_problems(id) ON DELETE CASCADE,
                company_id UUID REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                image_url TEXT,
                file_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_completion_approvals (
                project_id UUID REFERENCES open_problems(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (project_id, user_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_approvals (
                project_id UUID REFERENCES open_problems(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                comment TEXT,
                file_list TEXT[] DEFAULT '{}',
                funded_amount DECIMAL(12, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (project_id, user_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_completions (
                project_id UUID PRIMARY KEY REFERENCES open_problems(id) ON DELETE CASCADE,
                summary TEXT,
                final_cost DECIMAL(12, 2),
                completion_date DATE,
                maintenance_notes TEXT,
                rating INTEGER,
                final_image_list TEXT[] DEFAULT '{}',
                final_file_list TEXT[] DEFAULT '{}',
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
