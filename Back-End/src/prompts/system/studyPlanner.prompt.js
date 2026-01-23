// src/prompts/studyPlanner.prompt.js
export default function studyPlannerPrompt(sessionSummaries, performanceData, availableHours) {
  return `
You are an academic assistant.

Based on the following data, generate a personalized study schedule.
- Focus on weak topics first
- Allocate time according to difficulty & importance
- Suggest sessions in hours/days
- Include links to practice questions if available

Session Summaries:
${JSON.stringify(sessionSummaries)}

Student Performance:
${JSON.stringify(performanceData)}

Available Study Time: ${availableHours} hours

Respond ONLY in JSON:

{
  "success": true,
  "plan": [
    {
      "concept": "string",
      "topic": "string",
      "priority": "high|medium|low",
      "studyTimeHours": number,
      "recommendedPracticeQuestions": ["q1", "q2"]
    }
  ]
}
`;
}
