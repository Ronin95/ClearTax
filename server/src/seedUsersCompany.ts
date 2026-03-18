import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

async function seedCompanyUsers() {
    try {
        await initDB();
        
        console.log("🏢 Starting seeding process for 200 companyUsers...");

        for (let i = 1; i <= 200; i++) {
            const id = crypto.randomUUID();
            const username = faker.internet.username();
            const email = faker.internet.email();
            const hashedPassword = "$2b$10$verysecretfakehash";
            const companyName = faker.company.name(); // Generates fictional company name
            
            // Random date between Jan 1, 2020 and today
            const randomDate = faker.date.between({ 
                from: '2020-01-01T00:00:00.000Z', 
                to: new Date() 
            });

            // The specific pool.query for company users
            await pool.query(
                `INSERT INTO users (id, username, email, hashed_password, role_id, company_name, created_at) 
                 VALUES ($1, $2, $3, $4, 2, $5, $6)`,
                [id, username, email, hashedPassword, companyName, randomDate]
            );

            if (i % 100 === 0) console.log(`✅ Processed ${i}/200 companyUsers...`);
        }

        console.log("🏁 Seeding complete! 200 companyUsers inserted into postgres.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedCompanyUsers();
