const sendMessage = require("../services/whatsappService");
const askRag = require("../vectorless-rag/rag");

async function handleMenu(phone, text, credentials) {
  const clientName = credentials?.clientName || "PRO-SOLEXPERT";
  const clientId = credentials?.clientId || null;
  
  try {
    const aiResponse = await askRag(text, clientName, clientId);
    if (aiResponse) {
      return sendMessage(phone, aiResponse, credentials);
    }
  } catch (error) {
    console.error("Vectorless RAG Error:", error);
  }

  // Fallback if AI fails or doesn't provide a useful answer
  return sendMessage(phone, `I'm sorry, I'm having trouble retrieving that information right now. Please wait for one of our team members from ${clientName} to assist you.`, credentials);
}

module.exports = handleMenu;
