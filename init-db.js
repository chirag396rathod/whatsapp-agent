const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initDB() {
    try {
        await client.connect();
        console.log("Connected to database...");

        // Create Clients table (Main Table)
        await client.query(`
            CREATE TABLE IF NOT EXISTS clients (
                client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                wbi VARCHAR(255),
                phone_number VARCHAR(20),
                client_name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password TEXT,
                pin_id VARCHAR(50),
                auth_token TEXT,
                secret TEXT,
                plan_id INTEGER,
                recharge DECIMAL(10, 2) DEFAULT 0.00,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'clients' created or already exists.");

        // Create Customers table (User Table)
        await client.query(`
            CREATE TABLE IF NOT EXISTS customers (
                user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
                phone_number VARCHAR(20),
                name VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(client_id, phone_number)
            );
        `);
        console.log("Table 'customers' created or already exists.");

        // Create Documents table
        await client.query(`
            CREATE TABLE IF NOT EXISTS documents (
                doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
                doc_json JSONB,
                max_token_len INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'documents' created or already exists.");

        // Create Activity table
        await client.query(`
            CREATE TABLE IF NOT EXISTS activity (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
                customer_phone VARCHAR(20),
                type VARCHAR(20), -- 'incoming', 'outgoing'
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'activity' created or already exists.");

        console.log("✅ Database initialization complete!");
    } catch (err) {
        console.error("❌ Error initializing database:", err);
    } finally {
        await client.end();
    }
}

initDB();
