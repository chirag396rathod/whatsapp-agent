const axios = require("axios");
const { getCredentials } = require("../credentialsManager");
const pool = require("../db");

async function sendMessage(to, message, credentials, usage = null) {
  // Use provided credentials or fall back to system defaults
  let accessToken, phoneId;
  
  if (credentials && credentials.accessToken && credentials.phoneId) {
    accessToken = credentials.accessToken;
    phoneId = credentials.phoneId;
  } else {
    const systemCreds = getCredentials();
    accessToken = systemCreds.accessToken;
    phoneId = systemCreds.phoneId;
  }

  if (!accessToken || !phoneId) {
    console.warn("Attempted to send a message, but credentials are not set.");
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log Outgoing Activity if we have a clientId
    if (credentials && credentials.clientId) {
      let rawCost = 0;
      let billedCost = 0;
      if (usage && usage.cost) {
        rawCost = usage.cost;
        // 10x charge, converted to INR (assume 1 USD = 84 INR)
        billedCost = rawCost * 10 * 84;
      }

      await pool.query(
        'INSERT INTO activity (client_id, customer_phone, type, message, model, input_tokens, output_tokens, cost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          credentials.clientId, 
          to, 
          'outgoing', 
          message, 
          usage?.model || null, 
          usage?.input_tokens || null, 
          usage?.output_tokens || null, 
          billedCost
        ]
      );

      // Deduct from wallet balance
      if (billedCost > 0) {
        await pool.query(
          'UPDATE clients SET recharge = recharge - $1 WHERE client_id = $2',
          [billedCost, credentials.clientId]
        );
      }
    }
  } catch (err) {
    if (err.response) {
      console.error(
        "WhatsApp API Error:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("Error sending message:", err.message);
    }
  }
}

module.exports = sendMessage;
