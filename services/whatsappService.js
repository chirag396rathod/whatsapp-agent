const axios = require("axios");
const { getCredentials } = require("../credentialsManager");
const pool = require("../db");

async function sendMessage(to, message, credentials) {
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
      await pool.query(
        'INSERT INTO activity (client_id, customer_phone, type, message) VALUES ($1, $2, $3, $4)',
        [credentials.clientId, to, 'outgoing', message]
      );
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
