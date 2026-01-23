import { generateQuiz } from "../agents/quiz.agent.js";
import { processHighlight } from "./explanation.graph.js";

export async function generateQuizFromHighlight(highlight, courseId, materialId) {
  // Step 1: Ensure explanation exists
  const fullHighlight = await processHighlight(highlight, courseId, materialId);

  // Step 2: Generate quiz questions
  const quiz = await generateQuiz(fullHighlight, fullHighlight.explanation);

  // Step 3: Return structured data
  return {
    ...fullHighlight,
    quiz
  };
}
