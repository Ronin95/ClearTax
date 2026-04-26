import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedTransactions() {
    try {
        await initDB();
        
        const usersRes = await pool.query('SELECT id, created_at, available_amount, contributed_amount FROM users WHERE role_id = 1;');
        const users = usersRes.rows;

        const catsRes = await pool.query('SELECT id FROM funding_categories;');
        const categoryIds = catsRes.rows.map(r => r.id);

        if (users.length === 0) {
            console.error("❌ ERROR: No users found.");
            process.exit(1);
        }

        console.log(`🌱 Generating 1000 transactions...`);

        for (let i = 1; i <= 1000; i++) {
            const id = crypto.randomUUID();
            const randomUser = faker.helpers.arrayElement(users);
            const categoryId = faker.helpers.arrayElement(categoryIds);
            
            const maxSpend = parseFloat(randomUser.available_amount) * 0.05;
            const spendAmount = faker.number.float({ min: 10, max: maxSpend, fractionDigits: 2 });

            const transactionDate = faker.date.between({
                from: randomUser.created_at,
                to: new Date()
            });

            await pool.query(
                `INSERT INTO contributions (id, user_id, category_id, contributed_amount_by_user, created_at) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, randomUser.id, categoryId, spendAmount, transactionDate]
            );

            await pool.query(
                `UPDATE users 
                 SET available_amount = available_amount - $1, 
                     contributed_amount = contributed_amount + $1 
                 WHERE id = $2`,
                [spendAmount, randomUser.id]
            );

            if (i % 100 === 0) console.log(`✅ ${i}/1000 transactions created and balances synced...`);
        }

        console.log("🏁 Transactions Successfully created!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedTransactions();
