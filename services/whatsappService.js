const axios = require("axios");
const { getCredentials } = require("../credentialsManager");

async function sendMessage(to, message) {
  const { accessToken, phoneId } = getCredentials();

  if (!accessToken || !phoneId) {
    console.warn("Attempted to send a message, but credentials are not set. Please set them via the dynamic auth flow.");
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
