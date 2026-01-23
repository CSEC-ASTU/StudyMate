import express from "express";
import { ingestTextController, ingestFile, query } from "../controllers/rag.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/ingest-text", express.json(), ingestTextController);
router.post("/ingest-file", upload.single("file"), ingestFile);
router.post("/query", express.json(), query);

export default router;
