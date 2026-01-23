import { processSession } from "../graphs/summary.graph.js";

export async function getSessionSummary(req, res) {
  const { sessionData } = req.body; // array of highlight+explanation+quiz objects

  const result = await processSession(sessionData);

  res.json(result);
}
