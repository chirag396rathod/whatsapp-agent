const pool = require("../db");

async function migrate() {
    try {
        console.log("Starting migration...");
        await pool.query(`
            ALTER TABLE activity 
            ADD COLUMN IF NOT EXISTS model VARCHAR(255), 
            ADD COLUMN IF NOT EXISTS input_tokens INTEGER, 
            ADD COLUMN IF NOT EXISTS output_tokens INTEGER, 
            ADD COLUMN IF NOT EXISTS cost DECIMAL(15, 10);
        `);
        console.log("✅ Table 'activity' altered successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        process.exit();
    }
}

migrate();
