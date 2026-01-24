import express from "express";
import multer from "multer";
import { startLectureHandler, stopLectureHandler } from "../controllers/lecture.controller.js";
import { receiveChunkHandler } from "../controllers/stream.controller.js";
import { handleLiveLectureAudio } from "../controllers/lectureInput.controller.js";
import { getExplanation } from "../controllers/explanation.controller.js";
import { getQuiz } from "../controllers/quiz.controller.js";
import { getSessionSummary } from "../controllers/summary.controller.js";
import { lectureStreamHandler } from "../controllers/lectureStream.controller.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/live/audio", upload.single("audio"), handleLiveLectureAudio);

router.post("/start", startLectureHandler);
router.post("/stop", stopLectureHandler);

// chunk intake - using lectureId in params to ensure session exists
router.post("/:lectureId/chunk", receiveChunkHandler);

// Phase 2: Explanation
router.post("/explanation", getExplanation);

// Phase 3: Quiz
router.post("/quiz", getQuiz);

// Phase 4 (or Phase 5 if you have summary agent)
router.post("/summary", getSessionSummary);

// Lecture Stream (SSE)
router.get("/:lectureId/stream", lectureStreamHandler);


export default router;
