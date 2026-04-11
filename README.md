# 🌞 SolExpert WhatsApp AI Bot

A production-ready WhatsApp AI assistant for **PRO-SOLEXPERT**, a solar panel cleaning company. The bot uses a custom **Vectorless RAG** (Retrieval-Augmented Generation) system powered by **OpenRouter → GPT-4o-mini** to answer customer queries intelligently — without any vector database.

---

## 📁 Project Structure

```
solexpert-bot/
├── server.js                    # Main Express server entry point
├── config.js                    # Centralised environment config
├── credentialsManager.js        # Manages WhatsApp API credentials at runtime
├── package.json
├── .env                         # Environment variables (never commit this)
│
├── routes/
│   └── webhook.js               # WhatsApp webhook handler (GET verify + POST messages)
│
├── flows/
│   └── menuFlow.js              # Main message handler — routes queries to RAG
│
├── services/
│   └── whatsappService.js       # Sends WhatsApp messages via Meta Cloud API
│
├── public/
│   └── index.html               # Web UI to set up Facebook/WhatsApp credentials
│
├── data/
│   ├── solexpert bot.pdf        # Source document (image-based PDF — for reference)
│   ├── solexpert-content.txt    # ⚠️ Plain text version of PDF (required for RAG)
│   ├── documents.json           # Auto-generated RAG index (produced by buildIndex.js)
│   └── credentials.json         # Auto-saved WhatsApp credentials
│
└── vectorless-rag/
    ├── buildIndex.js            # Run this to rebuild the RAG index from text data
    ├── rag.js                   # Core RAG query engine (ask a question → get answer)
    └── core/
        ├── parseDoc.js          # Reads plain text source file
        ├── structureBuilder.js  # Splits text into logical tree/chunk nodes
        ├── treeEnricher.js      # Enriches nodes with AI-generated summaries
        ├── summarizer.js        # Calls OpenRouter to summarize each chunk
        └── retriever.js         # Keyword-based context retriever (no vectors)
```

---

## 🧠 How Vectorless RAG Works

Instead of expensive vector embeddings and a vector database, this system uses a **tree-based document index**:

```
Plain Text Content File
         ↓
   parseDoc.js (extract lines)
         ↓
structureBuilder.js (split into chunks/sections)
         ↓
treeEnricher.js + summarizer.js (generate summaries per chunk via OpenRouter)
         ↓
documents.json (saved index)
         ↓
retriever.js (keyword scoring to find top relevant chunks)
         ↓
rag.js (pass context + question to OpenRouter GPT-4o-mini → answer)
```

**Benefits:** No Pinecone, no ChromaDB, no embeddings API costs. Just a JSON file + fast keyword retrieval.

---

## ⚙️ Setup & Installation

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd solexpert-bot
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# WhatsApp / Meta Cloud API
VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
APP_SECRATE=your_app_secret
APP_PASSWORD=your_admin_password

# OpenRouter API (https://openrouter.ai)
OPEN_AI_API_KEY=sk-or-v1-your-openrouter-key
```

> Get your free OpenRouter API key at [openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Prepare Your Knowledge Base

Since the source PDF is image-based (scanned), you must provide a plain text version:

1. Copy the content from `data/solexpert bot.pdf` manually
2. Save it as `data/solexpert-content.txt`

### 4. Build the RAG Index

```bash
node vectorless-rag/buildIndex.js
```

This reads `data/solexpert-content.txt`, chunks it, generates summaries via OpenRouter, and saves the index to `data/documents.json`.

> ⚠️ **Re-run this every time you update the content file.**

### 5. Start the Server

```bash
npm run start
```

The server runs on **port 3000**.

---

## 🌐 WhatsApp Webhook Setup

### Expose Locally with ngrok

```bash
ngrok http 3000
```

### Configure on Meta Developer Console

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Set your webhook URL to: `https://<your-ngrok-url>/webhook`
3. Set the **Verify Token** to match `VERIFY_TOKEN` in your `.env`
4. Subscribe to the `messages` field

### Set WhatsApp Credentials via Web UI

Visit `http://localhost:3000` in your browser to enter your **WhatsApp Access Token** and **Phone Number ID** through the setup UI.

---

## 🤖 AI Model

| Component | Provider | Model |
|-----------|----------|-------|
| RAG Query Engine | OpenRouter | `openai/gpt-4o-mini` |
| Chunk Summarizer | OpenRouter | `openai/gpt-4o-mini` |

The bot responds:
- Based **only** on the indexed document content
- In **English or Hindi** matching the user's language
- In **short, WhatsApp-friendly** messages (1–3 sentences)
- With a fallback to contact `info@solexpert.in` for unknown queries

---

## 🔄 Updating the Knowledge Base

To update what the bot knows:

1. Edit `data/solexpert-content.txt` with the new content
2. Re-run the index builder:
   ```bash
   node vectorless-rag/buildIndex.js
   ```
3. Restart the server:
   ```bash
   npm run start
   ```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server |
| `openai` | OpenAI-compatible SDK (used with OpenRouter) |
| `dotenv` | Environment variable loading |
| `fs-extra` | File utilities |
| `uuid` | Unique IDs for RAG nodes |

---

## 🔒 Security Notes

- **Never commit `.env`** to version control — it's in `.gitignore`
- The `data/credentials.json` file contains live API tokens — keep it private
- `data/documents.json` is auto-generated — no need to commit it

### `.gitignore` entries

```
.env
data/credentials.json
data/documents.json
node_modules/
```

---

## 📱 Message Flow

```
User sends WhatsApp message
         ↓
   webhook.js receives POST
         ↓
   menuFlow.js → askRag(query)
         ↓
   retriever.js scores documents.json
         ↓
   Top 3 matching chunks → OpenRouter API
         ↓
   GPT-4o-mini answer → WhatsApp reply
```

---

## 🛠️ Development

```bash
# Start server
npm run start

# Rebuild RAG index
node vectorless-rag/buildIndex.js

# Expose to internet
ngrok http 3000
```

---

## 📄 License

ISC © PRO-SOLEXPERT
