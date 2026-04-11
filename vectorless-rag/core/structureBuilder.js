const { v4: uuidv4 } = require("uuid");

const CHUNK_SIZE = 300; // words per chunk

function detectHeadingLevel(line) {
  // All-caps short line (e.g. "SERVICES", "ABOUT US")
  if (/^[A-Z][A-Z\s\-]{3,50}$/.test(line.trim())) return 1;
  // Numbered section (e.g. "1. Introduction")
  if (/^\d+\.\s+\S/.test(line.trim())) return 2;
  // Sub-numbered section (e.g. "1.1 Details")
  if (/^\d+\.\d+\s+\S/.test(line.trim())) return 3;
  // Short title-case line under 60 chars (e.g. "Solar Panel Cleaning Benefits")
  if (line.trim().length < 60 && /^[A-Z][a-zA-Z\s\-]+$/.test(line.trim()) && line.trim().split(" ").length <= 8) return 2;
  return 0;
}

function createNode(title, level) {
  return {
    id: uuidv4(),
    title,
    level,
    content: "",
    summary: "",
    keywords: [],
    children: []
  };
}

function chunkIntoNodes(lines) {
  // Fallback: split flat text into ~CHUNK_SIZE word chunks
  const allText = lines.join(" ");
  const words = allText.split(/\s+/);
  const root = createNode("ROOT", 0);
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(" ");
    const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
    const node = createNode(`Section ${chunkNum}`, 1);
    node.content = chunk;
    root.children.push(node);
  }
  return root;
}

function buildTree(lines) {
  const root = createNode("ROOT", 0);
  const stack = [root];
  let headingCount = 0;

  lines.forEach(line => {
    const level = detectHeadingLevel(line);
    if (level > 0) headingCount++;
  });

  // If fewer than 3 headings detected, use chunk-based fallback
  if (headingCount < 3) {
    return chunkIntoNodes(lines);
  }

  lines.forEach(line => {
    const level = detectHeadingLevel(line);
    if (level > 0) {
      const node = createNode(line, level);
      while (stack.length > level) stack.pop();
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      stack[stack.length - 1].content += " " + line;
    }
  });

  return root;
}

module.exports = buildTree;
