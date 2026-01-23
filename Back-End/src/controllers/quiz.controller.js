import { generateQuizFromHighlight } from "../graphs/quiz.graph.js";

export async function getQuiz(req, res) {
  const { highlight, courseId, materialId } = req.body;

  const result = await generateQuizFromHighlight(highlight, courseId, materialId);

  res.json(result);
}
