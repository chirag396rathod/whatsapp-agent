const { v4: uuidv4 } = require("uuid");

function buildTree(lines) {
  const tree = {
    id: uuidv4(),
    title: "ROOT", // Document root
    content: "",
    summary: "",
    keywords: [],
    children: []
  };

  let currentH1 = null;
  let currentH2 = null;

  lines.forEach(line => {
    // Detect headings (better logic for documents)
    if (line.match(/^[A-Z0-9\s:&\-]+$/) && line.length > 3 && line.length < 50) {
      // H1
      currentH1 = { 
        id: uuidv4(),
        title: line, 
        content: "",
        summary: "",
        keywords: [],
        children: [] 
      };
      tree.children.push(currentH1);
      currentH2 = null;
    } 
    else if (line.match(/^\d+\.\s/) || line.match(/^PRODUCT \/ SERVICE \d+/) || line.match(/^[A-Z][A-Za-z\s]+:$/)) {
      // H2 - supports numbered lists, "PRODUCT / SERVICE 1", and "Key Features:"
      currentH2 = { 
        id: uuidv4(),
        title: line, 
        content: "",
        summary: "",
        keywords: [],
        children: [] 
      };
      if (currentH1) {
        currentH1.children.push(currentH2);
      } else {
        tree.children.push(currentH2);
      }
    } 
    else {
      // Content
      if (currentH2) {
        currentH2.content += " " + line;
      } else if (currentH1) {
        currentH1.content += " " + line;
      } else {
        tree.content += " " + line;
      }
    }
  });

  return tree;
}

module.exports = buildTree;
