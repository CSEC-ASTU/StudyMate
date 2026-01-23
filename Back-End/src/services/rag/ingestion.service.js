import { v4 as uuidv4 } from "uuid";
import { embedText } from "../../utils/embedder.js";
import { chunkDocument } from "./chunking.service.js";
import { qdrant } from "../../config/qdrant.client.js";

export async function ingestText({
    text,
    metadata,
}) {
    const chunks = chunkDocument(text);

    const points = [];

    for (let i = 0; i < chunks.length; i++) {
        const vector = await embedText(chunks[i]);

        points.push({
            id: uuidv4(),
            vector,
            payload: {
                text: chunks[i],
                position: i,
                timestamp: new Date().toISOString(),
                ...metadata, // course_id, lecture_id, etc
            },
        });
    }

    await qdrant.upsert("studymate_docs", { points });

    return points.length;
}
