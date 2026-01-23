import { processHighlight } from "../graphs/explanation.graph.js";

export async function getExplanation(req, res) {
  const { highlight, courseId, materialId } = req.body;

  const result = await processHighlight(highlight, courseId, materialId);

  res.json(result);
}
