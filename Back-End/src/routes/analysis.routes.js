import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as courseProgressController from '../controllers/courseProgress.controller.js';
import * as semesterAnalysisController from '../controllers/semesterAnalysis.controller.js';

const router = express.Router();

router.get('/courses/:courseId/progress', authenticate, courseProgressController.getCourseProgress);
router.get('/semesters/:semesterId/analysis', authenticate, semesterAnalysisController.getSemesterAnalysis);

export default router;
