const sendMessage = require("../services/whatsappService");
const askRag = require("../vectorless-rag/rag");

async function handleMenu(phone, text) {
  try {
    const aiResponse = await askRag(text);
    if (aiResponse) {
      return sendMessage(phone, aiResponse);
    }
  } catch (error) {
    console.error("Vectorless RAG Error:", error);
  }

  // Fallback if AI fails or doesn't provide a useful answer
  return sendMessage(phone, "I'm sorry, I'm having trouble retrieving that information right now. Please try again later.");
}

module.exports = handleMenu;
