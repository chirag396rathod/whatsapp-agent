require("dotenv").config();

module.exports = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
};
