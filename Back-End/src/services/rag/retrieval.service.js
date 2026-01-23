import { embedText } from "../../utils/embedder.js";
import { qdrant } from "../../config/qdrant.client.js";

export async function retrieveContext({
    question,
    filters = {},
    topK = 5,
}) {
    const qVec = await embedText(question);

    const must = Object.entries(filters).map(([key, value]) => ({
        key,
        match: { value },
    }));

    const results = await qdrant.search("studymate_docs", {
        vector: qVec,
        limit: topK * 4,
        filter: must.length ? { must } : undefined,
        withPayload: true,
    });

    const filtered = results
        .filter(r => r.score > 0.35)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(r => r.payload.text);

    return filtered;
}
