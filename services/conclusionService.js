const OpenAI = require("openai");
const config = require("../config");

const aiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPEN_AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://solexpert.in",
    "X-OpenRouter-Title": "SolExpert WhatsApp Bot Admin"
  }
});

async function getChatSummary(messages, clientId = null) {
    if (!messages || messages.length === 0) {
        return {
            userAsks: "No recent messages found.",
            aiSolutions: "No recent interactions found."
        };
    }

    const chatContent = messages.map(m => `${m.type === 'incoming' ? 'User' : 'AI'}: ${m.message}`).join("\n");

    try {
        const res = await aiClient.chat.completions.create({
            model: config.MODAL_NAME || "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI auditor for a solar company. Analyze the provided chat history from the last 24 hours.
                    Extract two things:
                    1. What the user specifically asked or requested.
                    2. What solutions or information the AI assistant provided.
                    
                    Respond in JSON format:
                    {
                        "userAsks": "brief summary of user queries",
                        "aiSolutions": "brief summary of AI's answers"
                    }`
                },
                { role: "user", content: chatContent }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(res.choices[0].message.content);
        
        // Log this system activity if needed
        try {
            const pool = require("../db");
            const usage = res.usage;
            let billedCost = 0;
            if (usage && usage.cost) {
                billedCost = usage.cost * 10 * 84; // 10x charge in INR
            }

            // We use a dummy phone number or null for system events
            await pool.query(
                'INSERT INTO activity (client_id, type, message, model, input_tokens, output_tokens, cost) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [clientId, 'system', 'Generated chat summary (conclusion)', res.model, usage?.prompt_tokens || null, usage?.completion_tokens || null, billedCost]
            );

            if (clientId && billedCost > 0) {
                await pool.query(
                    'UPDATE clients SET recharge = recharge - $1 WHERE client_id = $2',
                    [billedCost, clientId]
                );
            }
        } catch (logErr) {
            console.error("Failed to log conclusion usage:", logErr.message);
        }

        return result;
    } catch (err) {
        console.error("AI Summary Error:", err);
        return {
            userAsks: "Error generating summary.",
            aiSolutions: "Error generating summary."
        };
    }
}

module.exports = { getChatSummary };
