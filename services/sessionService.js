/**
 * sessionService.js
 * In-memory multi-layer session/memory system for WhatsApp bot.
 *
 * Key Design:
 * - Sessions are keyed by `${clientId}:${phone}` for multi-tenant isolation
 * - Each session stores last N turns (sliding window)
 * - Sessions auto-expire after 30 minutes of inactivity
 * - No external dependencies (pure in-memory)
 */

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_TURNS = 10; // Keep last 10 conversation turns

/** @type {Map<string, { history: Array, lastTopic: string|null, lastActive: number }>} */
const sessions = new Map();

/**
 * Build a unique session key for multi-tenant isolation.
 * @param {string} clientId
 * @param {string} phone
 * @returns {string}
 */
function getSessionKey(clientId, phone) {
  return `${clientId}:${phone}`;
}

/**
 * Check if a session is expired and clean it up.
 * @param {string} key
 * @returns {boolean} true if expired/missing
 */
function isExpired(key) {
  const session = sessions.get(key);
  if (!session) return true;
  if (Date.now() - session.lastActive > SESSION_TTL_MS) {
    sessions.delete(key);
    return true;
  }
  return false;
}

/**
 * Get or create a session for the given client/phone pair.
 * @param {string} clientId
 * @param {string} phone
 * @returns {{ history: Array, lastTopic: string|null, lastActive: number }}
 */
function getSession(clientId, phone) {
  const key = getSessionKey(clientId, phone);

  if (isExpired(key)) {
    // Start a fresh session
    const fresh = { history: [], lastTopic: null, lastActive: Date.now() };
    sessions.set(key, fresh);
    return fresh;
  }

  const session = sessions.get(key);
  session.lastActive = Date.now(); // Refresh TTL on access
  return session;
}

/**
 * Add a user→AI turn to the session history (sliding window of MAX_TURNS).
 * @param {string} clientId
 * @param {string} phone
 * @param {string} userMessage
 * @param {string} aiResponse
 * @param {string|null} topic   Optional detected topic tag (e.g. "pricing", "services")
 */
function addTurn(clientId, phone, userMessage, aiResponse, topic = null) {
  const key = getSessionKey(clientId, phone);
  const session = getSession(clientId, phone); // Ensures session exists & TTL refreshed

  session.history.push({
    role: 'user',
    content: userMessage
  });
  session.history.push({
    role: 'assistant',
    content: aiResponse
  });

  // Sliding window — keep last MAX_TURNS * 2 messages (each turn = 2 msgs)
  if (session.history.length > MAX_TURNS * 2) {
    session.history = session.history.slice(-MAX_TURNS * 2);
  }

  if (topic) {
    session.lastTopic = topic;
  }

  sessions.set(key, session);
}

/**
 * Get the conversation history for context building.
 * @param {string} clientId
 * @param {string} phone
 * @returns {Array<{ role: 'user'|'assistant', content: string }>}
 */
function getHistory(clientId, phone) {
  const key = getSessionKey(clientId, phone);
  if (isExpired(key)) return [];
  return sessions.get(key)?.history || [];
}

/**
 * Clear a session (e.g. on explicit "reset" command).
 * @param {string} clientId
 * @param {string} phone
 */
function clearSession(clientId, phone) {
  const key = getSessionKey(clientId, phone);
  sessions.delete(key);
}

/**
 * Periodic cleanup of all expired sessions (call every ~10 min).
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [key, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      sessions.delete(key);
    }
  }
}

// Auto-cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

module.exports = {
  getSession,
  getHistory,
  addTurn,
  clearSession
};
