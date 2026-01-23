import LectureSessionService from "../services/lectureSession.service.js";
import LectureBufferService from "../utils/LectureBufferService.js";
import { lectureEventEmitter } from "../event/lecture.events.js";
import { ingestLectureChunk } from "../services/rag/ingestStream.service.js"; // import your RAG ingestion function
import conceptClassifierAgent from "../agents/conceptClassifier.agent.js"; // stub provided below

/**
 * POST /api/lecture/:lectureId/chunk
 * body: { transcriptText: string, startTime?: number, endTime?: number }
 */
export async function receiveChunkHandler(req, res) {
  const { lectureId } = req.params;
  const { transcriptText, startTime = Date.now(), endTime = Date.now() } = req.body;

  if (!transcriptText) return res.status(400).json({ error: "transcriptText required" });

  const session = LectureSessionService.getSession(lectureId);
  if (!session || !session.isActive) {
    return res.status(409).json({ error: "No active session for lectureId" });
  }

  try {
    // 1) Feed live micro-buffer (for flushing to live classifier)
    LectureBufferService.addChunk(transcriptText);

    // 2) Send chunk to RAG ingestion service (RAG-owned LectureMemoryService will buffer internally)
    // This is non-blocking from the perspective of downstream RAG flushes — ingestLectureChunk returns status
    const ragResult = await ingestLectureChunk({
      text: transcriptText,
      metadata: {
        lectureId: session.lectureId,
        courseId: session.courseId,
        materialIds: session.materialIds,
        source: "live_stream_chunk",
      },
    });

    // 3) Check if our micro buffer is ready (semantic chunk)
    const flushedText = LectureBufferService.flushIfReady();

    let highlightEmitted = false;
    if (flushedText) {
      // We have a semantic chunk ready for the fast classification pipeline
      const classifierInput = {
        lectureId: session.lectureId,
        courseId: session.courseId,
        materialIds: session.materialIds,
        transcriptText: flushedText,
        timestampStart: startTime,
        timestampEnd: endTime,
      };

      // conceptClassifierAgent is a stub / interface that you will implement
      // It should do: fast classification -> (if needed) context resolution -> return HighlightEvent or null
      const highlightEvent = await conceptClassifierAgent.processChunk(classifierInput);

      if (highlightEvent && highlightEvent.highlight === true) {
        // Emit highlight to any listeners (frontend, summary agent, etc.)
        lectureEventEmitter.emit("lecture.highlight", highlightEvent);
        highlightEmitted = true;
      }
    }

    return res.status(200).json({
      ok: true,
      ragStatus: ragResult.status, // "buffering" or "ingested"
      highlightEmitted,
    });
  } catch (err) {
    console.error("Error processing chunk:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
