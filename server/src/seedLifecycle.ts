import { pool } from './db.ts';
import { faker } from '@faker-js/faker';

async function seedLifecycle() {
    try {
        console.log("🌱 Fetching users, companies, and projects...");
        const users = (await pool.query('SELECT id FROM users WHERE role_id = 1')).rows;
        const companies = (await pool.query('SELECT id FROM users WHERE role_id = 2')).rows;
        const projects = (await pool.query('SELECT id, status FROM open_problems WHERE status != $1', ['Proposed'])).rows;

        if (companies.length === 0 || users.length === 0) {
            console.error("❌ You need regular users and companies to seed the lifecycle!");
            process.exit(1);
        }

        console.log(`🌱 Seeding lifecycle data for ${projects.length} advanced projects...`);
        let bidsCount = 0;
        let updatesCount = 0;
        let completionsCount = 0;
        let approvalsCount = 0;

        for (const p of projects) {
            // Give every advanced project 1-3 pending bids from random companies
            const numBids = faker.number.int({ min: 1, max: 3 });
            const biddingCompanies = faker.helpers.arrayElements(companies, numBids);
            
            let acceptedCompany = null;
            
            for (let i = 0; i < biddingCompanies.length; i++) {
                const comp = biddingCompanies[i];
                const isWinner = (p.status !== 'Funding Approved' && i === 0);
                const bidStatus = isWinner ? 'Accepted' : 'Pending';
                
                if (isWinner) acceptedCompany = comp.id;

                await pool.query(`
                    INSERT INTO project_bids (project_id, company_id, estimated_cost, pitch, file_list, status)
                    VALUES ($1, $2, $3, $4, ARRAY['LoremIpsum.pdf'], $5)
                `, [
                    p.id, comp.id, 
                    faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }), 
                    faker.company.catchPhrase(),
                    bidStatus
                ]);
                bidsCount++;
            }

            // If it's In Progress, Pending Completion, or Completed, give it updates!
            if (acceptedCompany) {
                // Assign the company to the main project
                await pool.query(`UPDATE open_problems SET assigned_company_id = $1 WHERE id = $2`, [acceptedCompany, p.id]);
                
                // Add 1-3 photo/text updates
                const numUpdates = faker.number.int({ min: 1, max: 3 });
                for(let i=0; i<numUpdates; i++) {
                    await pool.query(`
                        INSERT INTO project_updates (project_id, company_id, message)
                        VALUES ($1, $2, $3)
                    `, [p.id, acceptedCompany, faker.lorem.sentences(2)]);
                    updatesCount++;
                }
            }

            // If it's Pending Completion or Completed, insert a record into your new project_completions table!
            if (p.status === 'Pending Completion' || p.status === 'Completed') {
                await pool.query(`
                    INSERT INTO project_completions (project_id, summary, final_cost, completion_date, rating, final_file_list)
                    VALUES ($1, $2, $3, NOW(), 5, ARRAY['LoremIpsum.pdf'])
                    ON CONFLICT (project_id) DO NOTHING
                `, [
                    p.id, 
                    faker.lorem.paragraph(), 
                    faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 })
                ]);
                completionsCount++;
                
                // If it's completely Completed, it also needs 3 community approvals!
                if (p.status === 'Completed') {
                    const approvers = faker.helpers.arrayElements(users, 3);
                    for (const approver of approvers) {
                        await pool.query(`
                            INSERT INTO project_completion_approvals (project_id, user_id)
                            VALUES ($1, $2)
                            ON CONFLICT (project_id, user_id) DO NOTHING
                        `, [p.id, approver.id]);
                        approvalsCount++;
                    }
                }
            }
        }

        console.log(`🏁 Lifecycle Seeding Complete!`);
        console.log(`   - Created ${bidsCount} Company Bids`);
        console.log(`   - Created ${updatesCount} Progress Updates`);
        console.log(`   - Created ${completionsCount} Completion Reports`);
        console.log(`   - Created ${approvalsCount} Verification Sign-offs`);
        process.exit(0);

    } catch (err) {
        console.error("❌ Failed to seed lifecycle:", err);
        process.exit(1);
    }
}
seedLifecycle();
