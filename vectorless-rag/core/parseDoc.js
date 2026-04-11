const fs = require('fs');

async function parseDoc(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');

  // Normalize text
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

module.exports = parseDoc;
