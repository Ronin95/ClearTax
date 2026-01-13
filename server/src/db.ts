import immudbPkg from 'immudb-node';
import { apiConfig } from './config.ts';

const ImmudbClient: any = (immudbPkg as any).default || immudbPkg;

export const client = new ImmudbClient({
    host: apiConfig.immudb.host,
    port: apiConfig.immudb.port,
});

export async function initDB() {
    try {
        await client.initClient(
            apiConfig.immudb.user,
            apiConfig.immudb.password,
            apiConfig.immudb.database
        );
        
        console.log("✅ Successfully connected to immudb");

        // 1. Users Table
        await client.SQLExec({
            sql: `CREATE TABLE IF NOT EXISTS users (
                id VARCHAR[36],
                username VARCHAR[256],
                email VARCHAR[256],
                imageId VARCHAR[64],
                hashedPassword VARCHAR[256],
                createdAt TIMESTAMP,
                PRIMARY KEY id
            );`
        });

        // 2. Email Index
        try {
            await client.SQLExec({ sql: `CREATE UNIQUE INDEX ON users(email);` });
        } catch (idxErr) { /* Silent if exists */ }

        // 3. Categories Table
        await client.SQLExec({
            sql: `CREATE TABLE IF NOT EXISTS funding_categories (
                id INTEGER,
                name VARCHAR[64],
                PRIMARY KEY id
            );`
        });

        const categories = [
            { id: 1, name: 'Infrastructure' },
            { id: 2, name: 'Technology' },
            { id: 3, name: 'Transportation' }
        ];

        for (const cat of categories) {
            try {
                await client.SQLExec({ 
                    sql: `INSERT INTO funding_categories (id, name) VALUES (${cat.id}, '${cat.name}');` 
                });
            } catch (e) {
                // Keep this silent to avoid cluttering your console
            }
        }

        await client.SQLExec({
            sql: `CREATE TABLE IF NOT EXISTS contributions (
                id VARCHAR[36],
                userId VARCHAR[36],
                categoryId INTEGER,
                amount FLOAT, 
                createdAt TIMESTAMP,
                PRIMARY KEY id
            );`
        });
        
        console.log("✅ immudb Tables and Indices Initialized");
    } catch (err) {
        console.error("❌ DB Initialization failed:", err);
        process.exit(1);
    }
}
