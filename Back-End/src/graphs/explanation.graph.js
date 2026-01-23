// src/graphs/explanation.graph.js
import { generateExplanation } from "../agents/explanation.agent.js";
import { resolveContext } from "../services/context.service.js";

export async function processHighlight(highlight, courseId, materialId) {
  // 1️ Resolve context
  const context = await resolveContext({
    text: highlight.excerpt,
    courseId,
    materialId
  });

  // 2️ Generate explanation
  const explanation = await generateExplanation(highlight, context);

  // 3️ Return structured data
  return {
    ...highlight,
    explanation
  };
}
