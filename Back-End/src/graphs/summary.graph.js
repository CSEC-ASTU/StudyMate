import { generateSessionSummary } from "../agents/summarization.agent.js";
import { buildConceptGraph } from "../services/conceptGraph.service.js";

export async function processSession(sessionData) {
  // Step 1: Summarize session
  const summary = await generateSessionSummary(sessionData);

  if (!summary.success) return { success: false };

  // Step 2: Build concept graph
  const graph = buildConceptGraph(summary);

  // Step 3: Return both
  return {
    success: true,
    summary,
    conceptGraph: graph
  };
}
