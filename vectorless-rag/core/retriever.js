function scoreNode(node, query) {
  let score = 0;

  let rawContent = node.content || "";
  if (Array.isArray(rawContent)) {
    rawContent = rawContent.join(" ");
  }

  const text = (node.title + " " + (node.summary || "") + " " + rawContent).toLowerCase();
  
  // Split query into words to allow partial matching (ignore short words)
  const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
  
  queryWords.forEach(word => {
    if (text.includes(word)) score += 3;
  });

  if (node.keywords) {
    node.keywords.forEach(k => {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanK.length > 2 && queryWords.includes(cleanK)) {
        score += 5;
      }
    });
  }

  return score;
}

function searchTree(node, query, results = []) {
  const score = scoreNode(node, query);

  if (score > 0) {
    results.push({ node, score });
  }

  // Safely check if node has children before iterating (handles manually pasted JSON)
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child =>
      searchTree(child, query, results)
    );
  }

  return results;
}

function getTopContext(tree, query, limit = 3) {
  const results = searchTree(tree, query);

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.node);
}

module.exports = getTopContext;
