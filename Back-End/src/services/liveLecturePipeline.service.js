import LectureBufferService from "../utils/LectureBufferService.js";
import LectureSessionService from "./lectureSession.service.js";
import { lectureEventEmitter } from "../event/lecture.events.js";
import { ingestLectureChunk } from "./rag/ingestStream.service.js";
import conceptClassifierAgent from "../agents/conceptClassifier.agent.js";

export async function processTranscriptChunk({
  lectureId,
  transcriptText,
  startTime,
  endTime,
}) {
  if (!transcriptText) return null;

  const session = LectureSessionService.getSession(lectureId);

  if (!session || !session.isActive) {
    throw new Error("No active session");
  }

  // 1️⃣ Buffer
  LectureBufferService.addChunk(transcriptText);

  // 2️⃣ RAG
  const ragResult = await ingestLectureChunk({
    text: transcriptText,
    metadata: {
      lectureId: session.lectureId,
      courseId: session.courseId,
      materialIds: session.materialIds,
      source: "live_stream_chunk",
    },
  });

  // 3️⃣ Flush
  const flushedText = LectureBufferService.flushIfReady();

  let highlightEmitted = false;

  if (flushedText) {
    const classifierInput = {
      lectureId: session.lectureId,
      courseId: session.courseId,
      materialIds: session.materialIds,
      transcriptText: flushedText,
      timestampStart: startTime,
      timestampEnd: endTime,
    };

    const highlightEvent =
      await conceptClassifierAgent.processChunk(classifierInput);

    if (highlightEvent?.highlight) {
      lectureEventEmitter.emit("lecture.highlight", highlightEvent);
      highlightEmitted = true;
    }
  }

  return {
    ragStatus: ragResult.status,
    highlightEmitted,
  };
}
