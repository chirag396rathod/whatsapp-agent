const sendMessage = require("../services/whatsappService");
const askRag = require("../vectorless-rag/rag");
const { getHistory, addTurn } = require("../services/sessionService");

/**
 * handleMenu — main message dispatcher.
 * 
 * Flow:
 *  1. Load conversation history from session store (keyed by clientId:phone)
 *  2. Pass history + current message to RAG/AI engine
 *  3. Save the user→AI turn back to session for future context
 *  4. Send WhatsApp reply
 */
async function handleMenu(phone, text, credentials) {
  const clientName = credentials?.clientName || "PRO-SOLEXPERT";
  const clientId = credentials?.clientId || null;

  // --- 1. Load session memory ---
  const conversationHistory = clientId ? getHistory(clientId, phone) : [];

  try {
    // --- 2. Ask RAG with full conversation history ---
    const aiRes = await askRag(text, clientName, clientId, conversationHistory);

    if (aiRes && aiRes.text) {
      // --- 3. Save this turn to session memory ---
      if (clientId) {
        addTurn(clientId, phone, text, aiRes.text);
      }

      // --- 4. Send reply ---
      return sendMessage(phone, aiRes.text, credentials, aiRes.usage);
    }
  } catch (error) {
    console.error("Vectorless RAG Error:", error);
  }

  // Fallback if AI fails
  const fallback = `I'm sorry, I'm having trouble retrieving that information right now. Please wait for one of our team members from ${clientName} to assist you.`;
  return sendMessage(phone, fallback, credentials);
}

module.exports = handleMenu;
