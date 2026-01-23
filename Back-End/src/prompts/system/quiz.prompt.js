// src/prompts/quiz.prompt.js
export default function quizPrompt(highlight, explanation) {
  return `
You are an academic tutor.

Generate 1-3 practice questions for the following concept.
Include:
- Multiple-choice questions
- Short-answer questions
- Numerical problems if relevant
- Difficulty level: easy, medium, hard

Concept:
Title: "${highlight.title}"
Excerpt: "${highlight.excerpt}"
Explanation: "${explanation.explanation}"

Respond ONLY in JSON:

{
  "success": true,
  "questions": [
    {
      "type": "mcq|short_answer|numerical",
      "question": "string",
      "options": ["A", "B", "C", "D"], // only for mcq
      "answer": "string",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;
}
