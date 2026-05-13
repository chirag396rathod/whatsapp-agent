const OpenAI = require("openai");
const config = require("../config");

async function test() {
  const aiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: config.OPEN_AI_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://solexpert.in",
      "X-OpenRouter-Title": "SolExpert WhatsApp Bot Admin"
    }
  });

  const res = await aiClient.chat.completions.create({
    model: config.MODAL_NAME || "openai/gpt-4o-mini",
    messages: [
      { role: "user", content: "Hello" }
    ]
  });

  console.log(JSON.stringify(res, null, 2));
}

test().catch(console.error);
