const mammoth = require("mammoth");

async function parseDoc(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value; // plain text

  // Normalize text to iterate through lines sequentially properly in structureBuilder
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

module.exports = parseDoc;
