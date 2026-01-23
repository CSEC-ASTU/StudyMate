import { runLLM } from "../services/llm.service.js";
import explanationPrompt from "../prompts/system/explanation.prompt.js";

/**
 * Generate explanation for a highlight
 * @param {Object} highlight - highlight JSON from Phase 1
 * @param {Object} context - optional context from Phase 1
 * @returns {Promise<Object>}
 */
export async function generateExplanation(highlight, context = null) {
  const prompt = explanationPrompt(highlight, context);
  const response = await runLLM(prompt, "explanation");
  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Invalid LLM JSON:", response);
    return { success: false, explanation: null };
  }
}
