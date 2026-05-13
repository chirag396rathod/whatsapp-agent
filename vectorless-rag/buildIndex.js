require('dotenv').config();
const parseDoc = require("./core/parseDoc");
const buildTree = require("./core/structureBuilder");
const enrichTree = require("./core/treeEnricher");
const fs = require("fs-extra");

async function run() {
  const lines = await parseDoc("data/solexpert bot.docx");

  const tree = buildTree(lines);

  const enriched = await enrichTree(tree);

  await fs.writeJson("data/documents.json", enriched, { spaces: 2 });

  console.log("✅ Index built");
}

run();
