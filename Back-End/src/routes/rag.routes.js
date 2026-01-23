import express from "express";
import { ingest, query } from "../controllers/rag.controller.js";

const router = express.Router();

router.post("/ingest", express.json(), ingest);
router.post("/query", express.json(), query);

export default router;
