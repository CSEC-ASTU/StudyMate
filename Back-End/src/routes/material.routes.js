import express from 'express';
import upload from '../config/multer.js';
import { uploadMaterial } from '../controllers/material.controller.js';
// import { ingestFile } from "../controllers/rag.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/materials
// Multiparts form-data with 'file' and other fields
router.post('/', authenticate, upload.single('file'), uploadMaterial);

export default router;
