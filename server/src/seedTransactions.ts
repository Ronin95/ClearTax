import { client, initDB } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedTransactions() {
    try {
        await initDB();
        
        const usersRes = await client.SQLQuery({ sql: 'SELECT id FROM users LIMIT 145;' });
        const rawRows = Array.isArray(usersRes) ? usersRes : (usersRes?.rows || []);
        
        const userIds = rawRows.map((r: any) => {
            if (r.id) return r.id;
            if (r.values) return r.values[0].s;
            return null;
        }).filter(Boolean);

        const catsRes = await client.SQLQuery({ sql: 'SELECT id FROM funding_categories;' });
        const rawCats = Array.isArray(catsRes) ? catsRes : (catsRes?.rows || []);
        const categoryIds = rawCats.map((r: any) => {
            if (r.id) return r.id;
            if (r.values) return r.values[0].n;
            return null;
        }).filter(Boolean);

        console.log(`🔍 Debug: Found ${userIds.length} users and ${categoryIds.length} categories.`);

        if (userIds.length === 0) {
            console.error("❌ ERROR: No users found. Please run 'node src/seed.ts' first.");
            process.exit(1);
        }

        console.log(`🌱 Generating 145 transactions...`);

        for (let i = 1; i <= 145; i++) {
            const id = crypto.randomUUID();
            const userId = faker.helpers.arrayElement(userIds);
            const categoryId = faker.helpers.arrayElement(categoryIds);
            const amount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });

            await client.SQLExec({
                sql: `INSERT INTO contributions (id, userId, categoryId, amount, createdAt) 
                    VALUES ('${id}', '${userId}', ${categoryId}, ${amount}, NOW());`
            });

            if (i % 10 === 0) console.log(`✅ ${i}/145 transactions created...`);
        }

        console.log("🏁 Transactions Successfully Seeded!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedTransactions();
