import express from "express";
import multer from "multer";
import { startLectureHandler, stopLectureHandler } from "../controllers/lecture.controller.js";
import { receiveChunkHandler } from "../controllers/stream.controller.js";
import { handleLiveLectureAudio } from "../controllers/lectureInput.controller.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/live/audio", upload.single("audio"), handleLiveLectureAudio);

router.post("/start", startLectureHandler);
router.post("/stop", stopLectureHandler);

// chunk intake - using lectureId in params to ensure session exists
router.post("/:lectureId/chunk", receiveChunkHandler);

export default router;
