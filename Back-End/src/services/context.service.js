import { retrieveContext as searchRAG } from "./rag/retrieval.service.js";
// import { searchGoogle } from "./search.service.js";
import { searchMaterials } from "./material.service.js";

export async function resolveContext({
  text,
  courseId,
  materialId
}) {

  // 1. Local materials
  const local = await searchMaterials(text, materialId);
  if (local) return { source: "material", data: local };

  // 2. RAG
  const rag = await searchRAG(text, courseId);
  if (rag) return { source: "rag", data: rag };

  // 3. Web
//   const web = await searchGoogle(text);
//   if (web) return { source: "web", data: web };

  return null;
}
