const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrateData() {
    try {
        await client.connect();
        console.log("Connected to database...");

        // 1. Backfill Activity table
        console.log("Backfilling activity data...");
        await client.query(`
            UPDATE activity 
            SET type = COALESCE(type, activity_type, 'EVENT'),
                message = COALESCE(message, description, 'System Activity')
            WHERE type IS NULL OR message IS NULL
        `);

        // 2. Fix Customers Table - ensure 'name' is really there
        console.log("Verifying customers table 'name' column...");
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(100)`);
        
        console.log("✅ Data migration and verification complete!");
    } catch (err) {
        console.error("❌ Error during migration:", err);
    } finally {
        await client.end();
    }
}

migrateData();
