import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { hashPassword } from './utils/authUtils.ts';

async function seedUsers() {
    try {
        await initDB();

        console.log("🌱 Starting seeding process for 800 regularUsers...");

        for (let i = 1; i <= 800; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = await hashPassword("versysecretfakehash");
            const taxNumber = faker.string.numeric(9);

            const contributed = faker.number.float({ min: 100, max: 2000, fractionDigits: 2 });
            const available = faker.number.float({ min: 2500, max: 10000, fractionDigits: 2 });
            const randomDate = faker.date.between({
                from: '2020-01-01T00:00:00.000Z',
                to: new Date()
            });

            await pool.query(
                `INSERT INTO users (id, username, email, tax_number, hashed_password, role_id, available_amount, contributed_amount, created_at) 
                VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8)`, 
                [id, username, email, taxNumber, hashedPassword, available, contributed, randomDate]
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
