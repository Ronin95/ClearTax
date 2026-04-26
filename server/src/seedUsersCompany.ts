import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { hashPassword } from './utils/authUtils.ts';

async function seedCompanyUsers() {
    try {
        await initDB();

        console.log("🏢 Starting seeding process for 200 companyUsers...");

        for (let i = 1; i <= 200; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = await hashPassword("versysecretfakehash");
            const taxNumber = faker.string.numeric(9);
            const companyName = faker.company.name();
            const randomDate = faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: new Date() });

            await pool.query(
                `INSERT INTO users (id, username, email, tax_number, hashed_password, role_id, company_name, created_at) 
                 VALUES ($1, $2, $3, $4, $5, 2, $6, $7)`,
                [id, username, email, taxNumber, hashedPassword, companyName, randomDate]
            );

            if (i % 50 === 0) console.log(`✅ Processed ${i}/200 companyUsers...`);
        }
        console.log("🏁 Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedCompanyUsers();
