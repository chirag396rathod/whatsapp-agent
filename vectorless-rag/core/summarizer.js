require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function summarize(text) {
  if (!text || text.length < 50) return text;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
