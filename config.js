require("dotenv").config();

module.exports = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER || "openai", // fallback to openai
  MODAL_NAME: process.env.MODAL_NAME,
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
};
