const pool = require('../db');

async function checkConclusion(phone) {
    try {
        const res = await pool.query(
            'SELECT phone_number, name, conclusion FROM customers WHERE phone_number = $1',
            [phone]
        );
        console.log("Customer Data:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        process.exit();
    }
}

const phone = process.argv[2];
if (!phone) {
    console.log("Please provide a phone number.");
    process.exit();
}
checkConclusion(phone);
