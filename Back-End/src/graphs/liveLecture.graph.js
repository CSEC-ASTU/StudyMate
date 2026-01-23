import { detectHighlight } from "../agents/highlight.agent.js";
import { resolveContext } from "../services/context.service.js";

export async function processLectureChunk({
  text,
  courseId,
  materialId
}) {

  // Step 1: Detect
  const detection = await detectHighlight(text);

  if (!detection.isHighlight) {
    return {
      highlight: false,
      text
    };
  }

  // Step 2: Context
  const context = await resolveContext({
    text,
    courseId,
    materialId
  });

  // Step 3: Build result
  return {
    highlight: true,
    type: detection.type,
    title: detection.title,
    excerpt: detection.excerpt,
    context,
    confidence: detection.confidence,
    raw: text
  };
}
