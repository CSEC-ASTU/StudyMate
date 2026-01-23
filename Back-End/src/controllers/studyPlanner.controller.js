import { createAdaptivePlan } from "../graphs/studyPlanner.graph.js";

export async function getStudyPlan(req, res) {
  const { sessionSummaries, performanceData, availableHours, daysAvailable } = req.body;

  const result = await createAdaptivePlan(sessionSummaries, performanceData, availableHours, daysAvailable);

  res.json(result);
}
