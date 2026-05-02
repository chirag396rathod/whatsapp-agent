const express = require("express");
const router = express.Router();
const handleMenu = require("../flows/menuFlow");
const config = require("../config");

const pool = require("../db");

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post("/", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const metadata = value?.metadata;

    if (!message) return res.sendStatus(200);

    const phone = message.from;
    const text = message.text?.body;
    const phoneId = metadata?.phone_number_id;

    // Lookup client by phoneId (pin_id in database)
    let credentials = null;
    if (phoneId) {
      const clientRes = await pool.query(
        'SELECT auth_token, pin_id, client_id, client_name FROM clients WHERE pin_id = $1',
        [phoneId]
      );
      if (clientRes.rows.length > 0) {
        const client = clientRes.rows[0];
        credentials = {
          accessToken: client.auth_token,
          phoneId: client.pin_id,
          clientId: client.client_id,
          clientName: client.client_name
        };

        // 1. Upsert Customer
        const customerName = value?.contacts?.[0]?.profile?.name || "WhatsApp User";
        await pool.query(
          `INSERT INTO customers (client_id, phone_number, name, last_interaction) 
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (client_id, phone_number) 
           DO UPDATE SET last_interaction = CURRENT_TIMESTAMP, name = EXCLUDED.name`,
          [client.client_id, phone, customerName]
        );

        // 2. Log Incoming Activity
        await pool.query(
          'INSERT INTO activity (client_id, customer_phone, type, message) VALUES ($1, $2, $3, $4)',
          [client.client_id, phone, 'incoming', text]
        );
      }
    }

    await handleMenu(phone, text, credentials);

    res.sendStatus(200);
  } catch (err) {
    console.log("Webhook Error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
