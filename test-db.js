require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function testConnection() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to PostgreSQL!");

        // Optional: run a simple query
        const res = await client.query('SELECT NOW()');
        console.log("Database Time:", res.rows[0].now);

    } catch (err) {
        console.error("❌ Connection error", err.stack);
    } finally {
        await client.end();
    }
}

testConnection();
