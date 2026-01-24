import { attachLectureStream } from "../services/lectureStream.service.js";
import LectureSessionService from "../services/lectureSession.service.js";

export function lectureStreamHandler(req, res) {
  const { lectureId } = req.params;

  const session = LectureSessionService.getSession(lectureId);
  if (!session || !session.isActive) {
    return res.status(404).json({ error: "Lecture session not active" });
  }

  attachLectureStream({
    lectureId,
    req,
    res,
  });
}
