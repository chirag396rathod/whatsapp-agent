const OpenAI = require("openai");
const fs = require("fs");
const getTopContext = require("./core/retriever");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://solexpert.in",
    "X-OpenRouter-Title": "SolExpert WhatsApp Bot"
  }
});

// Avoid crashing if documents.json doesn't exist yet by adding a safety check or initializing dynamically if needed.
// However, per instructions, reading synchronously on load:
let tree = {};
try {
  tree = JSON.parse(
    fs.readFileSync("data/documents.json")
  );
} catch (e) {
  console.log("Warning: data/documents.json not found yet. Run node buildIndex.js first.");
}

async function ask(query) {
  const nodes = getTopContext(tree, query);

  const context = nodes
    .map(n => `Title: ${n.title}\nSummary: ${n.summary}`)
    .join("\n\n");

  const res = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant for PRO-SOLEXPERT, a solar panel cleaning company. 
Use the following company information context to answer user questions professionally and concisely.

RULES:
1. Only answer based on the context information provided in the user prompt.
2. Keep answers short and suitable for WhatsApp (1-3 sentences).
3. If you don't know the answer, ask them to wait for a human representative or contact support at info@solexpert.in.
4. Language should match the user's query (English/Hindi).`
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}`
      }
    ]
  });

  return res.choices[0].message.content;
}

module.exports = ask;
