const fs = require('fs');
const path = require('path');
const config = require('./config');

const CREDENTIALS_FILE = path.join(__dirname, 'data', 'credentials.json');

let inMemoryCredentials = {
  accessToken: config.WHATSAPP_TOKEN || '',
  phoneId: config.PHONE_NUMBER_ID || ''
};

// Try to load from file on startup
try {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    if (data.accessToken) inMemoryCredentials.accessToken = data.accessToken;
    if (data.phoneId) inMemoryCredentials.phoneId = data.phoneId;
  }
} catch (e) {
  console.error("Could not load credentials.json:", e.message);
}

function getCredentials() {
  return inMemoryCredentials;
}

function setCredentials(accessToken, phoneId) {
  inMemoryCredentials = { accessToken, phoneId };
  // Save to file
  try {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(inMemoryCredentials, null, 2), 'utf8');
    console.log("Credentials saved to data/credentials.json");
  } catch (e) {
    console.error("Failed to save credentials file:", e.message);
  }
}

module.exports = { getCredentials, setCredentials };
