// src/agents/quiz.agent.js
import { runLLM } from "../services/llm.service.js";
import quizPrompt from "../prompts/system/quiz.prompt.js";

/**
 * Generate quiz questions for a highlight
 * @param {Object} highlight - JSON from Phase 1
 * @param {Object} explanation - JSON from Phase 2
 * @returns {Promise<Object>} Quiz JSON
 */
export async function generateQuiz(highlight, explanation) {
  const prompt = quizPrompt(highlight, explanation);
  const response = await runLLM(prompt, "quiz");
  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Invalid LLM JSON:", response);
    return { success: false, questions: [] };
  }
}
