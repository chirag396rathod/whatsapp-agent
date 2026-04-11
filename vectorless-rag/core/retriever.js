function scoreNode(node, query) {
  let score = 0;

  const text = (node.title + " " + node.summary).toLowerCase();
  const q = query.toLowerCase();

  if (text.includes(q)) score += 5;

  node.keywords.forEach(k => {
    if (q.includes(k)) score += 2;
  });

  return score;
}

function searchTree(node, query, results = []) {
  const score = scoreNode(node, query);

  if (score > 0) {
    results.push({ node, score });
  }

  node.children.forEach(child =>
    searchTree(child, query, results)
  );

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
