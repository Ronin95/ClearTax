import { initDB, pool } from './db.ts';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

const templates = {
    1: [ // Infrastructure
        "Repair potholes on Silver Lining Boulevard",
        "Replace broken swings at Whispering Willow Park playground",
        "Fix the leaking roof at Archive House public library",
        "Install new LED streetlights in the Ironworks District",
        "Renovate the public restrooms at Crystal Creek Gardens",
        "Repaint the fading crosswalks near Neon Avenue",
        "Clear the storm drainage blockage on Ember Street",
        "Restore the historical marble fountain at Solstice Plaza",
        "Replace the outdated HVAC system in the Marble Hall Library",
        "Reinforce the structural support beams of the Old Harbor Bridge",
        "Re-turf the primary community soccer field at Aurora Heights Park",
        "Update the exterior limestone facade of the Ironwood Civic Center",
        "Install anti-slip heated pavement on Zenith Drive",
        "Construct a sustainable cedar fence for the community garden in Echo Valley",
        "Repair the cracked granite retaining wall at Mossy Lane",
        "Refurbish the digital information kiosk at Verdant Vale"
    ],
    2: [ // Technology
        "Install public high-speed Wi-Fi in Solstice Plaza",
        "Upgrade the server hardware for Lunar Heights digital services",
        "Implement smart traffic light sensors at the intersection of Zenith Drive",
        "Digitize the permit application process for Glass Tower Station",
        "Add solar-powered charging stations at Whispering Willow Park",
        "Install air quality monitoring sensors around Circuit City",
        "Deploy autonomous trash collection bins in the Ironworks District",
        "Install emergency satellite communication hubs at Aurora Heights Park",
        "Set up a VR historical tour terminal at Archive House",
        "Launch an automated smart-irrigation system for Crystal Creek Gardens",
        "Install biometric security gates at Ironwood Civic Center",
        "Upgrade the high-capacity fiber optic backbone under Silver Lining Boulevard",
        "Deploy AI-driven noise pollution sensors throughout Old Harbor",
        "Install interactive touchscreen navigation maps at the Mossy Lane hub",
        "Set up drone-delivery landing pads in the Echo Valley residential zone",
        "Integrate smart parking meters with mobile payment along Neon Avenue"
    ],
    3: [ // Transportation
        "Expand bus frequency for the Lunar Heights line",
        "Build a protected bike lane connecting Ember Street to downtown",
        "Add an electric bus charging hub at Marble Hall Library",
        "Improve the wayfinding signage at the Neon Avenue train station",
        "Launch a community bike-sharing program in Circuit City",
        "Repair the hydraulic elevators at the Silver Lining Boulevard subway entrance",
        "Establish a pedestrian-only cobblestone zone on Cobblestone Way",
        "Add a solar-powered water taxi terminal at the Old Harbor pier",
        "Install weather-shielded seating at the Zenith Drive bus stop",
        "Extend the magnetic levitation rail tracks through Echo Valley",
        "Upgrade the automated signaling system for the Ironworks District metro",
        "Create dedicated priority bus lanes along Silver Lining Boulevard",
        "Construct a glass skywalk connecting Glass Tower Station to the city center",
        "Install self-service bike repair stations at Verdant Vale",
        "Launch a fleet of hydrogen-powered ferries at Crystal Creek Gardens",
        "Implement a traffic-calming roundabout at the intersection of Mossy Lane"
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

        if (users.length === 0) {
            console.error("❌ ERROR: No regular users found. Please run seedUsersRegular.ts first.");
            process.exit(1);
        }

        if (categoryIds.length === 0) {
            console.error("❌ ERROR: No matching categories found in templates.");
            process.exit(1);
        }

        console.log(`🌱 Generating 1000 open problems (Citizens only) with relative dates...`);

        for (let i = 1; i <= 1000; i++) {
            const id = crypto.randomUUID();
            const randomUser = faker.helpers.arrayElement(users);
            const categoryId = faker.helpers.arrayElement(categoryIds) as keyof typeof templates;
            
            const templateList = templates[categoryId];
            const todo = faker.helpers.arrayElement(templateList);

            const problemDate = faker.date.between({
                from: randomUser.created_at,
                to: new Date()
            });

            await pool.query(
                `INSERT INTO open_problems (id, user_id, category_id, todo, created_at) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, randomUser.id, categoryId, todo, problemDate]
            );

            if (i % 100 === 0) console.log(`✅ ${i}/1000 problems created...`);
        }

        console.log("🏁 Open Problems Successfully Seeded!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedProblems();
