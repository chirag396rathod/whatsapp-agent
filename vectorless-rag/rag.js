const Groq = require("groq-sdk");
const fs = require("fs");
const getTopContext = require("./core/retriever");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
