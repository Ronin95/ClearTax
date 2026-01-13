import { client, initDB } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedUsers() {
    try {
        // 1. Ensure connection and tables are ready
        await initDB();
        
        console.log("🌱 Starting seeding process for 145 users...");

        for (let i = 1; i <= 145; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = "$2b$10$verysecretfakehash";
            const imageId = `img-${i}`;
            
            await client.SQLExec({
                sql: `INSERT INTO users (id, username, email, imageId, hashedPassword, createdAt) 
                      VALUES ('${id}', '${username}', '${email}', '${imageId}', '${hashedPassword}', NOW());`
            });

            if (i % 50 === 0) console.log(`✅ Processed ${i}/145 users...`);
        }

        console.log("🏁 Seeding complete! 145 users inserted into immudb.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedUsers();
