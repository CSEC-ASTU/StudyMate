import LectureSessionService from "../services/lectureSession.service.js";
import { lectureEventEmitter } from "../event/lecture.events.js";

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
