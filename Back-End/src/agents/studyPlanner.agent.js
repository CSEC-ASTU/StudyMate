// src/agents/studyPlanner.agent.js
import { runLLM } from "../services/llm.service.js";
import studyPlannerPrompt from "../prompts/system/studyPlanner.prompt.js";

/**
 * Generate a study plan based on performance & summaries
 * @param {Array} sessionSummaries - summaries from Phase 4
 * @param {Array} performanceData - [{conceptTitle, quizScore, marks}, ...]
 * @param {number} availableHours - available study time in hours
 * @returns {Promise<Object>} structured study plan
 */
export async function generateStudyPlan(sessionSummaries, performanceData, availableHours) {
  const prompt = studyPlannerPrompt(sessionSummaries, performanceData, availableHours);
  const response = await runLLM(prompt, "studyPlanner");

  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Invalid LLM JSON:", response);
    return { success: false, plan: [] };
  }
}
