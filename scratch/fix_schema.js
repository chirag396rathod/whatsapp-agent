const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixSchema() {
    try {
        await client.connect();
        console.log("Connected to database...");

        // 1. Fix Customers Table
        console.log("Altering customers table...");
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(100)`);
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        // Add unique constraint for upsert
        try {
            await client.query(`ALTER TABLE customers ADD CONSTRAINT unique_client_customer UNIQUE (client_id, phone_number)`);
        } catch (e) {
            console.log("Constraint might already exist.");
        }

        // 2. Fix Activity Table
        console.log("Altering activity table...");
        await client.query(`ALTER TABLE activity ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
        await client.query(`ALTER TABLE activity ADD COLUMN IF NOT EXISTS type VARCHAR(20)`);
        await client.query(`ALTER TABLE activity ADD COLUMN IF NOT EXISTS message TEXT`);

        console.log("✅ Schema updated successfully!");
    } catch (err) {
        console.error("❌ Error fixing schema:", err);
    } finally {
        await client.end();
    }
}

fixSchema();
