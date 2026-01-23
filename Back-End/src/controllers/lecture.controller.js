import LectureSessionService from "../services/lectureSession.service.js";
import { lectureEventEmitter } from "../event/lecture.events.js";
import LectureBufferService from "../utils/LectureBufferService.js";
import { processLectureChunk } from "../graphs/liveLecture.graph.js";

export async function startLectureHandler(req, res) {
  const { userId, courseId, materialIds = [], metadata = {} } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ error: "userId and courseId required" });
  }

  const session = LectureSessionService.startSession({
    userId,
    courseId,
    materialIds,
    metadata,
  });

  lectureEventEmitter.emit("lecture.started", {
    lectureId: session.lectureId,
    courseId: session.courseId,
    materialIds: session.materialIds,
    startedAt: session.startedAt,
  });

  return res.status(201).json({ lectureId: session.lectureId });
}

export async function stopLectureHandler(req, res) {
  const { lectureId } = req.body;
  if (!lectureId) return res.status(400).json({ error: "lectureId required" });

  const session = LectureSessionService.stopSession(lectureId);
  if (!session) return res.status(404).json({ error: "session not found" });

  lectureEventEmitter.emit("lecture.stopped", {
    lectureId,
    endedAt: session.endedAt,
  });

  return res.status(200).json({ ok: true });
}

export async function receiveTranscript(req, res) {

  const { text, courseId, materialId } = req.body;

  LectureBufferService.addChunk(text);

  const flushed = LectureBufferService.flushIfReady();

  if (!flushed) {
    return res.json({ status: "buffering" });
  }

  const result = await processLectureChunk({
    text: flushed,
    courseId,
    materialId
  });

  res.json(result);
}