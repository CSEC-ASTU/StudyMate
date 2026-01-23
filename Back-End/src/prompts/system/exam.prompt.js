// src/prompts/exam.prompt.js
export default function examPrompt(sessionSummaries, quizBank, numQuestions) {
  return `
You are an academic tutor.

Generate a practice exam with ${numQuestions} questions.
Use highlights, explanations, and previous quiz questions as source.
Include:
- MCQs
- Short-answer questions
- Numerical problems
- Difficulty levels

Respond ONLY in JSON:

{
  "success": true,
  "questions": [
    {
      "type": "mcq|short_answer|numerical",
      "question": "string",
      "options": ["A","B","C","D"], 
      "answer": "string",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;
}
