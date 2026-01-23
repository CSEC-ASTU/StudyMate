import { runExam } from "../graphs/exam.graph.js";

export async function takeExam(req, res) {
  const { sessionSummaries, quizBank, studentAnswers, numQuestions } = req.body;

  const result = await runExam(sessionSummaries, quizBank, studentAnswers, numQuestions);

  res.json(result);
}
