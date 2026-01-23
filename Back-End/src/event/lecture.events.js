import { EventEmitter } from "events";

export const lectureEventEmitter = new EventEmitter();

// Events emitted:
// "lecture.started" -> { lectureId, courseId, materialIds, startedAt }
// "lecture.stopped" -> { lectureId, endedAt }
// "lecture.highlight" -> highlight event payload for frontend
