import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedTransactions() {
    try {
        await initDB();
        
        const usersRes = await pool.query('SELECT id FROM users;');
        const userIds = usersRes.rows.map(r => r.id);

        const catsRes = await pool.query('SELECT id FROM funding_categories;');
        const categoryIds = catsRes.rows.map(r => r.id);

        console.log(`🔍 Debug: Found ${userIds.length} users and ${categoryIds.length} categories.`);

        if (userIds.length === 0) {
            console.error("❌ ERROR: No users found. Please run 'node src/seed.ts' first.");
            process.exit(1);
        }

        console.log(`🌱 Generating 1000 transactions...`);

        for (let i = 1; i <= 1000; i++) {
            const id = crypto.randomUUID();
            const userId = faker.helpers.arrayElement(userIds);
            const categoryId = faker.helpers.arrayElement(categoryIds);
            const amount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });

            await pool.query(
                `INSERT INTO contributions (id, user_id, category_id, amount) 
                 VALUES ($1, $2, $3, $4)`,
                [id, userId, categoryId, amount]
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
