// src/prompts/summarization.prompt.js
export default function summarizationPrompt(sessionData) {
  return `
You are an academic assistant.

Summarize the following lecture session.
Include:
- Key concepts grouped by topic
- Important formulas
- Short explanations
- Optional links to practice questions
- Concept relationships (dependencies between topics)

Session Data:
${JSON.stringify(sessionData)}

Respond ONLY in valid JSON:

{
  "success": true,
  "summary": [
    {
      "topic": "string",
      "concepts": [
        {
          "title": "string",
          "excerpt": "string",
          "explanation": "string",
          "quiz_reference": ["question_id1", "question_id2"]
        }
      ]
    }
  ]
}
`;
}
