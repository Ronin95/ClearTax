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
        "Refurbish the digital information kiosk at the Retz train station",
        "Install wildlife crossing fencing along the B7 expressway near Schrick",
        "Repair the cracked concrete boat ramp on the Danube canal in Hainburg",
        "Replace aging water main valves in the residential quarter of Mödling",
        "Upgrade the outdoor emergency sirens across the municipality of Neunkirchen",
        "Install covered bicycle parking racks at the train station in Laa an der Thaya",
        "Reconstruct the washed-out retaining gabions near the gorge in Gaming",
        "Resurface the asphalt pump track at the youth center in Traiskirchen",
        "Replace broken glass lanterns along the historic castle promenade in Dürnstein",
        "Clear fallen rock debris and secure the cliffside nets in Aggsbach Markt",
        "Install automated irrigation lines in the municipal park flowerbeds of Hollabrunn",
        "Upgrade fire hydrant flow regulators in the commercial zone of Vösendorf",
        "Repave the frost-heaved cobblestones on the church square in Eggenburg",
        "Replace malfunctioning railway crossing barrier arms in Orth an der Donau",
        "Reinforce the timber supports of the observation tower in the Dunkelsteinerwald",
        "Install tactile paving indicators at the tram terminus in Perchtoldsdorf",
        "Re-dredge sediment from the recreational swimming pond in Horn",
        "Restore the damaged wrought-iron bridge railings over the Piesting in Markt Piesting",
        "Install public electric vehicle charging stations near the town hall in Guntramsdorf",
        "Repair the perimeter security fence around the water reservoir in Purkersdorf",
        "Modernize the ventilation units in the volunteer fire brigade hall in Marchegg",
        "Upgrade the public outdoor lighting along the Danube promenade in Ybbs an der Donau",
        "Replace the degraded rubber safety tiles at the primary school playground in Bisamberg",
        "Repair the asphalt subsidence along the shoulder of the B303 near Göllersdorf",
        "Install a solar-powered pedestrian crossing beacon on the main avenue in Ternitz",
        "Clear heavy vegetation overgrowth obstructing traffic sightlines on the L11 near Lassee",
        "Reinforce the historic stone masonry of the city wall in Waidhofen an der Thaya",
        "Replace cracked cast-iron sewer manhole covers in the town center of Schwechat",
        "Resurface the synthetic running track at the district sports stadium in Scheibbs",
        "Install drought-tolerant landscaping along the boulevard median strip in Zwettl",
        "Refurbish the weather-damaged timber benches in the Kurpark gardens of Bad Vöslau",
        "Repair the automatic sliding entrance doors at the municipal senior center in Wolkersdorf",
        "Replace faulty groundwater monitoring telemetry probes in the Marchfeld agricultural basin",
        "Install protective netting to deter roosting birds under the railway overpass in Absdorf",
        "Clear gravel and silt accumulation from the concrete culvert beneath the B10 in Bruck an der Leitha",
        "Repaint faded designated bicycle lane markings along the inner ring road in Melk",
        "Upgrade the emergency backup diesel generator at the main water pumping station in Langenlois",
        "Replace corroded steel guardrails on the winding mountain pass road near Gutenstein",
        "Restore the weathered canvas sunshades at the municipal open-air pool in Berndorf",
        "Install solar-powered waste compacting bins along the pedestrian zone in Gmünd",
        "Repair frost-damaged sandstone steps leading to the parish church square in Ernstbrunn"
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
        "Integrate smart parking meters with the Handyparken app in Graz",
        "Deploy optical fiber broadband infrastructure to rural households in Mistelbach",
        "Install automated license plate recognition cameras at the border crossing in Berg",
        "Implement IoT soil moisture telemetry across agricultural fields in Marchfeld",
        "Set up smart occupancy sensors in the public underground garages of Linz",
        "Upgrade cybersecurity threat monitoring systems for the Vienna General Hospital network",
        "Install contactless NFC ticketing validator terminals at regional bus hubs in Mödling",
        "Deploy automated flood warning water-level radar sensors along the Enns river",
        "Implement an AI-assisted citizen service chatbot for the city administration in Salzburg",
        "Install solar-powered digital bus departure display timetables in Baden",
        "Set up LoRaWAN gateways for municipal asset tracking in Wiener Neustadt",
        "Deploy smart grid load-balancing software across the regional power network in St. Pölten",
        "Install acoustic gunshot detection hardware in urban security zones in Favoriten",
        "Upgrade legacy municipal archives to a secure cloud storage repository in Krems",
        "Deploy automated drone surveillance for thermal leak detection in Tulln heating networks",
        "Install dynamic overhead variable-message speed limit signs on the A1 Autobahn",
        "Implement a blockchain-based land registry verification portal in Eisenstadt",
        "Set up wireless environmental radiation monitoring beacons in the Weinviertel",
        "Install automated passenger counting sensors on the regional S-Bahn fleet",
        "Deploy smart leak-detection acoustic sensors along the drinking water grid in Klagenfurt",
        "Launch an open-data digital twin platform for urban planning in Innsbruck",
        "Deploy remote temperature telemetry sensors in municipal server rooms across Lower Austria",
        "Install automated avalanche warning radar arrays along the mountain passes in Semmering",
        "Implement a smart public lighting management dashboard for the municipality of Korneuburg",
        "Set up wireless water quality monitoring buoys in the Old Danube recreational area",
        "Upgrade edge computing hardware at traffic surveillance hubs along the S1 expressway",
        "Install biometric access control readers at the municipal utility depot in Amstetten",
        "Deploy real-time vibration sensors on the historic railway viaducts in Breitenstein",
        "Integrate an automated digital queue management kiosk system at the district hall in Hollabrunn",
        "Set up predictive maintenance sensors on sewage pumping stations in Groß-Enzersdorf",
        "Install interactive augmented reality guideboards at the Carnuntum archaeological park",
        "Deploy low-power wide-area network nodes for forest fire detection in the Wienerwald",
        "Implement a centralized EV charging management platform for municipal fleet vehicles in Traiskirchen",
        "Install automated optical sorting systems at the regional recycling plant in Stockerau",
        "Upgrade legacy copper telecommunication cables to gigabit fiber lines in Retz",
        "Deploy drone flight paths for automated rooftop solar potential mapping in Poysdorf",
        "Implement smart pressure monitoring valves along the regional natural gas pipeline in Baumgarten",
        "Install dynamic parking space guidance displays across the city center of Melk",
        "Set up an automated river level SMS alert system for residents in the Triesting valley",
        "Deploy thermal imaging cameras for building energy loss audits in Neunkirchen",
        "Implement a unified open-source digital identity portal for local businesses in Schwechat"
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
        "Implement a traffic-calming roundabout at the main intersection in Zistersdorf",
        "Add an express morning commuter rail service between Marchegg and Wien Hauptbahnhof",
        "Build a grade-separated bicycle highway linking Mödling to Vösendorf-Siebenhirten",
        "Install automated ticket vending kiosks at regional bus interchanges in Wolkersdorf",
        "Expand the Park-and-Ride facility capacity at the Tullnerfeld railway station",
        "Electrify the regional branch rail line connecting Korneuburg to Ernstbrunn",
        "Introduce an on-demand microtransit shuttle service for rural areas in Poysdorf",
        "Construct an accessible pedestrian underpass beneath the tracks at Retz station",
        "Implement transit signal priority for streetcars along the Ringstraße corridor",
        "Establish a secure, climate-controlled bike storage garage at Baden train station",
        "Extend tram line 67 to connect the new urban quarter in Favoriten",
        "Build dedicated carpooling lanes on the northern approach of the A22 Donauufer Autobahn",
        "Install electronic dynamic timetable screens at all bus stops in Deutsch-Wagram",
        "Resurface and widen the dedicated cycle paths through the Lobau nature reserve",
        "Introduce hybrid-electric regional commuter buses on routes around Gänserndorf",
        "Create a designated micro-mobility drop zone near the station plaza in Krems",
        "Construct a multi-modal transport interchange hub near the industrial zone in Schwechat",
        "Install speed-activated traffic-calming chicanes on the main entry road in Matzen",
        "Upgrade low-floor boarding platforms along regional tram lines in Gmünd",
        "Launch an electric cargo bike rental fleet for local commerce in Wiener Neustadt",
        "Expand late-night weekend feeder bus connections between Stockerau and surrounding villages",
        "Add direct weekend regional express trains between Wien Franz-Josefs-Bahnhof and Gmünd",
        "Construct a bidirectional protected bicycle track along the B9 corridor in Hainburg",
        "Install automated fare-collection turnstiles at the main concourse in St. Pölten",
        "Extend the operating hours of the on-demand night taxi service in Horn",
        "Build a dedicated park-and-ride facility adjacent to the S-Bahn stop in Bisamberg",
        "Introduce zero-emission hydrogen fuel-cell buses on regional routes in Amstetten",
        "Upgrade pedestrian safety refuges on high-speed crossing points along the B8 in Strasshof",
        "Establish an electric car-sharing hub near the primary town square in Guntramsdorf",
        "Widen the narrow commuter cycle path along the Triesting river near Berndorf",
        "Install real-time transit arrival countdown displays at rural bus shelters in Lassee",
        "Construct a grade-separated bicycle underpass beneath the railway line in Bruck an der Leitha",
        "Add synchronized schedule connections between regional buses and trains in Mistelbach",
        "Create designated short-term kiss-and-ride drop-off bays at Korneuburg station",
        "Implement a pedestrianized shared space zone along the town center boulevard in Purkersdorf",
        "Install automated e-scooter geofencing speed limiters in the pedestrian zone of Mödling",
        "Extend regional bus route coverage to connect the business park in Traiskirchen",
        "Build sheltered weather canopies along the bus platform bays in Waidhofen an der Ybbs",
        "Introduce low-floor, step-free community shuttle vans across the hills of Kahlenberg",
        "Resurface and widen the regional commuter bike corridor between Wolkersdorf and Ulrichskirchen",
        "Install acoustic pedestrian crossing signals at busy intersections in Ternitz"
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

                const amountRaised = faker.number.float({ min: 0, max: 2000, fractionDigits: 2 });
                const targetFunding = faker.number.float({ min: 2500, max: 15000, fractionDigits: 2 });
                const creatorWork = faker.datatype.boolean();
                const status = faker.helpers.arrayElement(dbStatuses);
                
                const problemDate = faker.date.between({ from: randomUser.created_at, to: new Date() });

                await pool.query(
                    `INSERT INTO open_problems (
                        id, user_id, category_id, project_name, summar_desc, 
                        image_list, file_list, latitude, longitude, 
                        amount_raised, target_funding, creator_work, status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [
                        id, randomUser.id, categoryId, projectName, summarDesc, 
                        [], [], latitude, longitude, amountRaised, targetFunding, creatorWork, 
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
