import lectureMemoryService from "../lectureMemory.service.js";
import { ingestText } from "./ingestion.service.js";

export async function ingestLectureChunk({
    text,
    metadata,
}) {
    lectureMemoryService.addChunk(text);

    if (!lectureMemoryService.shouldFlush()) {
        return { status: "buffering" };
    }

    const windowText = lectureMemoryService.flush();

    const stored = await ingestText({
        text: windowText,
        metadata: {
            ...metadata,
            source: "live_lecture",
        },
    });

    return {
        status: "ingested",
        stored_chunks: stored,
    };
}
