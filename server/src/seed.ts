import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedUsers() {
    try {
        // 1. Ensure connection and tables are ready
        await initDB();
        
        console.log("🌱 Starting seeding process for 1000 users...");

        for (let i = 1; i <= 1000; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = "$2b$10$verysecretfakehash";
            
            await pool.query(
                `INSERT INTO users (id, username, email, hashed_password) 
                 VALUES ($1, $2, $3, $4)`,
                [id, username, email, hashedPassword]
            );

            if (i % 50 === 0) console.log(`✅ Processed ${i}/1000 users...`);
        }

        console.log("🏁 Seeding complete! 1000 users inserted into postgres.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedUsers();
