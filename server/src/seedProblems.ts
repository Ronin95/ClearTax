import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

const templates = {
    1: [ // Infrastructure
        "Repair potholes on the main street between Auersthal and Bockfließ",
        "Replace broken swings at the Gänserndorf city park playground",
        "Fix the leaking roof at the Mistelbach public library",
        "Install new LED streetlights in the industrial district of Wolkersdorf",
        "Renovate the public restrooms at the Donauinsel",
        "Repaint the fading crosswalks near the Hauptplatz in Wiener Neustadt",
        "Clear the storm drainage blockage on the B8 federal highway",
        "Restore the historical fountain at the Rathausplatz in St. Pölten",
        "Replace the outdated heating system in the local school in Strasshof",
        "Reinforce the structural support beams of the bridge over the March river",
        "Re-turf the primary community soccer field in Deutsch-Wagram",
        "Update the exterior facade of the municipal building in Matzen",
        "Install anti-slip pavement on the steep road in Kahlenberg",
        "Construct a sustainable fence for the community garden in Schönkirchen",
        "Repair the retaining wall along the vineyards in Poysdorf",
        "Refurbish the digital information kiosk at the Retz train station"
    ],
    2: [ // Technology
        "Install public high-speed Wi-Fi at the Stephansplatz",
        "Upgrade the server hardware for the Lower Austria digital services",
        "Implement smart traffic light sensors at the intersection in Kagran",
        "Digitize the building permit application process for the municipality of Auersthal",
        "Add solar-powered charging stations for e-bikes in the Weinviertel region",
        "Install air quality monitoring sensors around the Schwechat refinery",
        "Deploy smart trash collection bins in the Donauzentrum district",
        "Install emergency communication hubs in the alpine region of Schneeberg",
        "Set up a VR historical tour terminal at the Schönbrunn Palace",
        "Launch an automated smart-irrigation system for the Burggarten",
        "Install modern security gates at the Vienna International Centre",
        "Upgrade the fiber optic backbone connecting Gänserndorf and Vienna",
        "Deploy noise pollution sensors along the A23 Südosttangente",
        "Install interactive touchscreen navigation maps at the Hauptbahnhof",
        "Set up drone-delivery testing zones in the rural areas of Waldviertel",
        "Integrate smart parking meters with the Handyparken app in Graz"
    ],
    3: [ // Transportation
        "Expand bus frequency for the route between Auersthal and Bockfließ",
        "Build a protected bike lane connecting Strasshof to the S-Bahn station",
        "Add an electric bus charging hub at the Vienna Westbahnhof",
        "Improve the wayfinding signage at the Wien Mitte train station",
        "Launch a community Nextbike sharing program in Mistelbach",
        "Repair the elevators at the U1 Karlsplatz subway entrance",
        "Establish a pedestrian-only zone on the Mariahilfer Straße",
        "Add a solar-powered terminal for the Twin City Liner at Schwedenplatz",
        "Install weather-shielded seating at the regional bus stop in Groß-Enzersdorf",
        "Extend the S-Bahn railway tracks towards the Slovakian border",
        "Upgrade the automated signaling system for the U4 metro line",
        "Create dedicated priority bus lanes along the Gürtel",
        "Construct a pedestrian bridge connecting the Prater to the Handelskai",
        "Install self-service bike repair stations along the Donauradweg",
        "Launch a fleet of electric ferries at the Neusiedler See",
        "Implement a traffic-calming roundabout at the main intersection in Zistersdorf"
    ]
};

async function seedProblems() {
    try {
        await initDB();
        
                const usersRes = await pool.query('SELECT id, created_at FROM users WHERE role_id = 1;');
        const users = usersRes.rows;

        const catsRes = await pool.query('SELECT id FROM funding_categories;');
        
        const categoryIds = catsRes.rows
            .map(r => r.id)
            .filter(id => id in templates); 

        // NEW: Fetch all valid status names directly from the database table
        const statusesRes = await pool.query('SELECT name FROM project_statuses;');
        const dbStatuses = statusesRes.rows.map(r => r.name);

        if (dbStatuses.length === 0) {
            console.error("❌ ERROR: No statuses found in project_statuses table. Did you update initDB?");
            process.exit(1);
        }

        if (users.length === 0) {
            console.error("❌ ERROR: No regular users found. Please run seedUsersRegular.ts first.");
            process.exit(1);
        }

        if (categoryIds.length === 0) {
            console.error("❌ ERROR: No matching categories found in templates.");
            process.exit(1);
        }

        console.log(`🌱 Generating unique open problems from templates...`);

        let count = 0;
        
        // Loop through each category in your templates
        for (const categoryIdStr of Object.keys(templates)) {
            const categoryId = parseInt(categoryIdStr);
            if (!categoryIds.includes(categoryId)) continue;

            const templateList = templates[categoryId as keyof typeof templates];
            
            // Loop through every exact project name exactly once
            for (const projectName of templateList) {
                count++;
                const id = crypto.randomUUID();
                const randomUser = faker.helpers.arrayElement(users);
                
                const summarDesc = faker.lorem.paragraph();
                const latitude = faker.location.latitude({ min: 47.5, max: 48.8, precision: 6 });
                const longitude = faker.location.longitude({ min: 15.5, max: 17.0, precision: 6 });
                const amountRaised = faker.number.float({ min: 0, max: 5000, fractionDigits: 2 });
                const creatorWork = faker.datatype.boolean();
                const status = faker.helpers.arrayElement(dbStatuses);
                
                const problemDate = faker.date.between({
                    from: randomUser.created_at,
                    to: new Date()
                });

                await pool.query(
                    `INSERT INTO open_problems (
                        id, user_id, category_id, project_name, summar_desc, 
                        image_list, file_list, latitude, longitude, 
                        amount_raised, creator_work, status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                    [
                        id, randomUser.id, categoryId, projectName, summarDesc, 
                        [], [], latitude, longitude, amountRaised, creatorWork, 
                        status, problemDate
                    ]
                );
            }
        }

        console.log(`🏁 Successfully Seeded ${count} Unique Open Problems!`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedProblems();
