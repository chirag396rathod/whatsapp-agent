const summarize = require("./summarizer");

async function enrichNode(node) {
  if (node.content) {
    node.summary = await summarize(node.content);

    // simple keyword extraction
    node.keywords = node.summary
      .split(" ")
      .filter(w => w.length > 5)
      .slice(0, 5);
  }

  for (const child of node.children) {
    await enrichNode(child);
  }

  return node;
}

module.exports = enrichNode;
