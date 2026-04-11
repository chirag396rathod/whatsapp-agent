require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://solexpert.in",
    "X-OpenRouter-Title": "SolExpert WhatsApp Bot"
  }
});

async function summarize(text) {
  if (!text || text.length < 50) return text;

  const res = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Summarize in 2-3 lines with key information only"
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return res.choices[0].message.content;
}

module.exports = summarize;
