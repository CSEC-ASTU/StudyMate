import { runLLM } from "../services/llm.service.js";
import examPrompt from "../prompts/system/exam.prompt.js";

/**
 * Generate a practice exam
 * @param {Array} sessionSummaries - lecture summaries
 * @param {Array} quizBank - existing quiz questions
 * @param {number} numQuestions - desired number of questions
 * @returns {Promise<Object>} exam JSON
 */
export async function generateExam(sessionSummaries, quizBank, numQuestions = 10) {
  const prompt = examPrompt(sessionSummaries, quizBank, numQuestions);
  const response = await runLLM(prompt);

  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Invalid LLM JSON:", response);
    return { success: false, questions: [] };
  }
}
