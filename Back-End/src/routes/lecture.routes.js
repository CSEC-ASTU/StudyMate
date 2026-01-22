import express from "express";
import multer from "multer";
import { handleLiveLectureAudio } from "../controllers/lectureInput.controller.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/live/audio", upload.single("audio"), handleLiveLectureAudio);

export default router;
