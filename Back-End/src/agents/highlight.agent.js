import { runLLM } from "../services/llm.service.js";
import highlightPrompt from "../prompts/system/highlight.prompt.js";

/**
 * Detect if a lecture chunk is a highlight
 * @param {string} text
 * @returns {Promise<Object>} JSON with isHighlight, type, title, excerpt, confidence
 */
export async function detectHighlight(text) {
  const prompt = highlightPrompt(text);

  const response = await runLLM(prompt); // returns string JSON
  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("LLM returned invalid JSON:", response);
    return { isHighlight: false };
  }
}
