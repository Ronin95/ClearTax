import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedTransactions() {
    try {
        await initDB();
        
        // Fetch both ID and Created Date
        const usersRes = await pool.query('SELECT id, created_at FROM users;');
        const users = usersRes.rows;

        const catsRes = await pool.query('SELECT id FROM funding_categories;');
        const categoryIds = catsRes.rows.map(r => r.id);

        console.log(`🔍 Debug: Found ${users.length} users and ${categoryIds.length} categories.`);

        if (users.length === 0) {
            console.error("❌ ERROR: No users found. Please run 'node src/seed.ts' first.");
            process.exit(1);
        }

        console.log(`🌱 Generating 1000 transactions with relative dates...`);

        for (let i = 1; i <= 1000; i++) {
            const id = crypto.randomUUID();
            const randomUser = faker.helpers.arrayElement(users);
            const categoryId = faker.helpers.arrayElement(categoryIds);
            const amount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });

            // Generate date between user creation and now
            const transactionDate = faker.date.between({
                from: randomUser.created_at,
                to: new Date()
            });

            await pool.query(
                `INSERT INTO contributions (id, user_id, category_id, amount, created_at) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, randomUser.id, categoryId, amount, transactionDate]
            );

            if (i % 100 === 0) console.log(`✅ ${i}/1000 transactions created...`);
        }

        console.log("🏁 Transactions Successfully created!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedTransactions();
