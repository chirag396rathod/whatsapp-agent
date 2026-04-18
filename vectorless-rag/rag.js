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

async function ask(query) {
  // Pre-check layer
  if (!(await isSolarRelated(query))) {
    console.log(`Pre-check rejected query: "${query}"`);
    return HARD_REJECTION_MESSAGE;
  }

  let tree = {};
  try {
    tree = JSON.parse(fs.readFileSync("data/documents.json"));
  } catch (e) {
    console.log("Warning: data/documents.json not found yet.");
  }

  const nodes = getTopContext(tree, query);
  console.log("nodes", nodes);
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
        content: `You are a professional WhatsApp business assistant for PRO-SOLEXPERT.
Your job is to format responses in a clean, attractive, and highly readable WhatsApp style.

STRICT FORMATTING RULES:

1. USE ONLY WHATSAPP MARKUP:
   - Use *asterisks* for bold.
   - NEVER use double asterisks (**text**) or hashes (###).
   - If the context contains Markdown, you MUST convert it (e.g., change **bold** to *bold*).

2. VISUAL STRUCTURE:
   - Use a clear title: ✅ *Title Name*
   - Use double line breaks between sections for readability.
   - Keep each bullet point to a maximum of 2 sentences.
   - ✅ use only when share details otherwise don't use and use according to the context.

3. EMOJI PLACEMENT:
   - Always place emojis OUTSIDE the asterisks.
   - Correct: 🚀 *Fast Delivery*
   - Incorrect: *🚀 Fast Delivery*

4. RESPONSE CONTENT:
   - Start with a friendly intro.
   - Use the provided context to answer the user accurately.
   - End with a clear Call to Action (CTA) using 💬.
   📱 WHATSAPP FORMATTING RULES (MANDATORY):
    1. Use ONLY *asterisks* for bold
    2. NEVER use:
      - **double asterisks**
      - # headings
    3. Convert any markdown to WhatsApp format

5. GUARDRAILS & OUT-OF-BOUNDS REJECTION:
   - 🛑 STRICT ENFORCEMENT: You must ONLY answer questions based on the provided Context.
   - If the user asks a question about a topic completely unrelated to PRO-SOLEXPERT, solar cleaning, or the provided Context (e.g., weather, cars, cooking, coding, or other companies), you MUST REJECT it and say: 
     "I'm sorry, I am a specialized assistant for PRO-SOLEXPERT and can only answer questions related to our solar cleaning services. For anything else, please contact our support at info@solexpert.in 😊."
   - If the user asks a valid company question but the exact details are NOT in the context, say: 
     "✅ *PRO-SOLEXPERT Info*\n\nI'm sorry, but I don't have specific details about that right now ✨. For more complex queries, please contact our support at info@solexpert.in or wait for one of our team members to assist you 💬."
   - General greetings (Hi, Hello, Good morning) without specific questions should be greeted back warmly, guiding them to ask about your services.
   - Do NOT invent facts or guess answers. Stay strictly within the provided context boundaries.
   🚫 STRICT REJECTION RULE:
    If question is OUT-OF-SCOPE, ALWAYS reply EXACTLY:

    "I'm sorry, I am a specialized assistant for PRO-SOLEXPERT and can only answer questions related to our solar cleaning services. For anything else, please contact our support at info@solexpert.in 😊."

    DO NOT:
    - Explain
    - Add extra lines
    - Try to be helpful
    - Answer partially

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
