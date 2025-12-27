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

        // 1. Create the Users Table (Removed UNIQUE from the inline definition)
        await client.SQLExec({
            sql: `CREATE TABLE IF NOT EXISTS users (
                id VARCHAR[36],
                email VARCHAR[256],
                hashedPassword VARCHAR[256],
                createdAt TIMESTAMP,
                PRIMARY KEY id
            );`
        });

        // 2. Create a UNIQUE INDEX for the email (This is how ImmuDB handles uniqueness)
        try {
            await client.SQLExec({
                sql: `CREATE UNIQUE INDEX ON users(email);`
            });
        } catch (idxErr) {
            // Ignore error if index already exists
            console.log("ℹ️ Note: User email index already exists or skipped.");
        }

        // 3. Create the Refresh Tokens Table
        await client.SQLExec({
            sql: `CREATE TABLE IF NOT EXISTS refresh_tokens (
                token VARCHAR[256],
                userId VARCHAR[36],
                expiresAt TIMESTAMP,
                PRIMARY KEY token
            );`
        });
        
        console.log("✅ immudb Tables and Indices Initialized");
    } catch (err) {
        console.error("❌ Connection to immudb failed:", err);
        process.exit(1);
    }
}
