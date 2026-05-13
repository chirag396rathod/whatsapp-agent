const pool = require('../db');

async function updateSchema() {
    try {
        await pool.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS conclusion JSONB;
        `);
        console.log("Successfully added conclusion column to customers table.");
    } catch (err) {
        console.error("Error updating schema:", err.message);
    } finally {
        process.exit();
    }
}

updateSchema();
