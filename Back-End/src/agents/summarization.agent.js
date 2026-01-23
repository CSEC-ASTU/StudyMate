import { runLLM } from "../services/llm.service.js";
import summarizationPrompt from "../prompts/system/summarization.prompt.js";

/**
 * Summarize a list of highlights/explanations
 * @param {Array} sessionData - [{highlight, explanation, quiz}, ...]
 * @returns {Promise<Object>} summary JSON
 */
export async function generateSessionSummary(sessionData) {
  const prompt = summarizationPrompt(sessionData);
  const response = await runLLM(prompt, "summarization");

  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Invalid LLM JSON:", response);
    return { success: false, summary: null };
  }
}
