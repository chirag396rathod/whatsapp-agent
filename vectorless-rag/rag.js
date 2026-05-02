const OpenAI = require("openai");
const fs = require("fs");
const getTopContext = require("./core/retriever");
const config = require("../config");

let aiClient;
let activeModel;

// Default to OpenRouter
aiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPEN_AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://solexpert.in",
    "X-OpenRouter-Title": "SolExpert WhatsApp Bot"
  }
});
activeModel = config.MODAL_NAME;
console.log("AI Provider: OpenRouter (Model: " + activeModel + ")");

// Avoid crashing if documents.json doesn't exist yet by adding a safety check or initializing dynamically if needed.
// However, per instructions, reading synchronously on load:
async function isSolarRelated(query) {
  try {
    const res = await aiClient.chat.completions.create({
      model: activeModel,
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: "system",
          content: "You are a specialized classification bot. Return EXACTLY 'YES' if the user's text is related to solar panels, solar cleaning, solar maintenance, PRO-SOLEXPERT services, or basic greetings (Hi, Hello). Return EXACTLY 'NO' if it is a completely unrelated topic (e.g. food, weather, coding, other companies)."
        },
        { role: "user", content: query }
      ]
    });
    const ans = res.choices[0].message.content.trim().toUpperCase();
    return !ans.includes("NO");
  } catch (err) {
    return true; // Fallback to safely allow normal processing if the API acts up
  }
}

const HARD_REJECTION_MESSAGE = "I'm sorry, I am a specialized assistant for PRO-SOLEXPERT and can only answer questions related to our solar cleaning services. For anything else, please contact our support at info@solexpert.in 😊.";

const pool = require("../db");

async function ask(query, clientName = "PRO-SOLEXPERT", clientId = null) {
  let tree = {};

  // Try to load from database if clientId is provided
  if (clientId) {
    try {
      const dbRes = await pool.query(
        'SELECT doc_json FROM documents WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
        [clientId]
      );
      if (dbRes.rows.length > 0) {
        tree = dbRes.rows[0].doc_json;
      }
    } catch (err) {
      console.error("Database Knowledge Base Error:", err.message);
    }
  }

  // Fallback to local file if DB load failed or no clientId
  if (!tree || Object.keys(tree).length === 0) {
    try {
      tree = JSON.parse(fs.readFileSync("data/documents.json"));
    } catch (e) {
      console.log("Warning: data/documents.json not found yet.");
    }
  }

  const nodes = getTopContext(tree, query);

  const context = nodes
    .map(n => {
      let contentText = n.content || n.summary || "";
      if (Array.isArray(contentText)) contentText = contentText.join(", ");
      return `Section: ${n.title}\nDetails: ${contentText}`;
    })
    .join("\n\n");

  const res = await aiClient.chat.completions.create({
    model: activeModel,
    messages: [
      {
        role: "system",
        content: `You are a professional WhatsApp business assistant for ${clientName}.
Your job is to format responses in a clean, attractive, and highly readable WhatsApp style.

STRICT FORMATTING RULES:

1. USE ONLY WHATSAPP MARKUP:
   - Use *asterisks* for bold.
   - NEVER use double asterisks (**text**) or hashes (###).
   - If the context contains Markdown, you MUST convert it (e.g., change **bold** to *bold*).

2. VISUAL STRUCTURE:
   - Always start with a bold title related to the topic: ✅ *Title Name*
   - Use double line breaks (\n\n) between every section (Intro, Content, CTA).
   - NEVER send a single large block of text. Break it into readable paragraphs.
   - Keep each bullet point to a maximum of 2 sentences.
   - Use emojis at the start of paragraphs to improve scannability.

3. EMOJI PLACEMENT:
   - Always place emojis OUTSIDE the asterisks.
   - Correct: 🚀 *Fast Delivery*
   - Incorrect: *🚀 Fast Delivery*

4. RESPONSE CONTENT:
   - Start with a warm greeting on its own line.
   - Use the provided context to answer the user accurately.
   - End with a clear Call to Action (CTA) on its own line using 💬.
   📱 WHATSAPP FORMATTING RULES (MANDATORY):
    1. Use ONLY *asterisks* for bold
    2. NEVER use:
      - **double asterisks**
      - # headings
    3. Convert any markdown to WhatsApp format

5. GUARDRAILS & OUT-OF-BOUNDS REJECTION:
   - 🛑 STRICT ENFORCEMENT: You must ONLY answer questions based on the provided Context.
   - If the user asks a question about a topic completely unrelated to ${clientName} or the provided Context, you MUST REJECT it and say: 
     "✅ *Support Assistant*\n\nI'm sorry, I am a specialized assistant for ${clientName} and can only answer questions related to our services. For anything else, please wait for one of our team members to assist you 😊."
   - If the user asks a valid company question but the exact details are NOT in the context, say: 
     "✅ *${clientName} Info*\n\nI'm sorry, but I don't have specific details about that right now ✨. For more complex queries, please wait for one of our team members to assist you 💬."
   - General greetings (Hi, Hello, Good morning) without specific questions should be greeted back warmly, then add a line break and ask how you can help with the specific business services.
   - Do NOT invent facts or guess answers. Stay strictly within the provided context boundaries.
   🚫 STRICT REJECTION RULE:
    If question is OUT-OF-SCOPE, ALWAYS reply EXACTLY:

    "✅ *Support Assistant*\n\nI'm sorry, I am a specialized assistant for ${clientName} and can only answer questions related to our services. For anything else, please wait for one of our team members to assist you 😊."

💬 Need help? Feel free to ask 😊`
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}`
      }
    ]

  });

  let aiResponse = res.choices[0].message.content;

  return aiResponse;
}

module.exports = ask;
