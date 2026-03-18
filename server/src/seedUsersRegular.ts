import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedUsers() {
    try {
        await initDB();
        
        console.log("🌱 Starting seeding process for 800 regularUsers...");

        for (let i = 1; i <= 800; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = "$2b$10$verysecretfakehash";
            
            // Generate a random date between Jan 1, 2020 and today
            const randomDate = faker.date.between({ 
                from: '2020-01-01T00:00:00.000Z', 
                to: new Date() 
            });

            await pool.query(
                `INSERT INTO users (id, username, email, hashed_password, role_id, created_at) 
                VALUES ($1, $2, $3, $4, 1, $5)`, 
                [id, username, email, hashedPassword, randomDate]
            );

            if (i % 100 === 0) console.log(`✅ Processed ${i}/800 users with unique dates...`);
        }

        console.log("🏁 Seeding complete! 800 regularUsers inserted.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedUsers();
