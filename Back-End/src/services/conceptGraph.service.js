export function buildConceptGraph(sessionSummary) {
  const graph = {};
  
  sessionSummary.summary.forEach(topic => {
    topic.concepts.forEach(concept => {
      graph[concept.title] = concept.dependencies || [];
    });
  });

  return graph; // { "Newton's Second Law": ["Force", "Mass"], ... }
}
