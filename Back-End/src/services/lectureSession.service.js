import { v4 as uuidv4 } from "uuid";
import LectureBufferService from "../utils/LectureBufferService.js";


class LectureSessionService {
  constructor() {
    this.sessions = new Map();
  }

  startSession({ userId, courseId, materialIds = [], metadata = {} }) {
    const lectureId = uuidv4();
    const session = {
      lectureId,
      userId,
      courseId,
      materialIds,
      startedAt: Date.now(),
      isActive: true,
      metadata,
    };

    this.sessions.set(lectureId, session);

    // Reset only the live buffer used by the live pipeline
    LectureBufferService.reset();

    return session;
  }

  stopSession(lectureId) {
    const s = this.sessions.get(lectureId);
    if (!s) return null;
    s.isActive = false;
    s.endedAt = Date.now();
    this.sessions.set(lectureId, s);
    return s;
  }

  getSession(lectureId) {
    return this.sessions.get(lectureId) ?? null;
  }

  getActiveSessionForUser(userId) {
    for (const s of this.sessions.values()) {
      if (s.userId === userId && s.isActive) return s;
    }
    return null;
  }
}

export default new LectureSessionService();
