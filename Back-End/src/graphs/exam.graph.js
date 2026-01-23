import { generateExam } from "../agents/exam.agent.js";
import { evaluateExam } from "../agents/examEvaluator.agent.js";

export async function runExam(sessionSummaries, quizBank, studentAnswers, numQuestions = 10) {
  // Step 1: Generate exam
  const exam = await generateExam(sessionSummaries, quizBank, numQuestions);

  if (!exam.success) return { success: false };

  // Step 2: Evaluate student's answers
  const results = evaluateExam(exam.questions, studentAnswers);

  // Step 3: Return exam + evaluation
  return {
    success: true,
    exam,
    results
  };
}
