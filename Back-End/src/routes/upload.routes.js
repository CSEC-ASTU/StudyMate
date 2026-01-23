import express from 'express';
import upload from '../config/multer.js';
import { uploadFile } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/upload
// Requires Authentication to get uploadedByUserId
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
