import { generateStudyPlan } from "../agents/studyPlanner.agent.js";
import { distributeStudyTime } from "../services/schedule.service.js";

export async function createAdaptivePlan(sessionSummaries, performanceData, availableHours, daysAvailable) {
  // Step 1: Generate priority plan
  const plan = await generateStudyPlan(sessionSummaries, performanceData, availableHours);

  if (!plan.success) return { success: false };

  // Step 2: Distribute across days
  const schedule = distributeStudyTime(plan.plan, daysAvailable);

  return {
    success: true,
    plan: plan.plan,
    schedule
  };
}
