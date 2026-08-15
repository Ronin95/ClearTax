import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { hashPassword } from './utils/authUtils.ts'; // <-- Use YOUR app's hasher!

async function seedUsers() {
    try {
        await initDB();
        console.log("🌱 Starting seeding process for 800 regularUsers...");

        for (let i = 1; i <= 800; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email().toLowerCase(); // <-- Forces lowercase!
            
            const plainTextPassword = 'password123';
            const hashedPassword = await hashPassword(plainTextPassword); // <-- PERFECT HASH!
            
            const taxNumber = faker.string.numeric(9);
            const contributedAmount = faker.number.float({ min: 100, max: 2000, fractionDigits: 2 });
            const availableAmount = faker.number.float({ min: 2500, max: 10000, fractionDigits: 2 });
            const randomDate = faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: new Date() });

            await pool.query(
                `INSERT INTO users (id, username, email, tax_number, hashed_password, role_id, available_amount, contributed_amount, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [id, username, email, taxNumber, hashedPassword, 1, availableAmount, contributedAmount, randomDate]
            );

            if (i % 100 === 0) console.log(`✅ Processed ${i}/800 users...`);
        }
        console.log("🏁 Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedUsers();
