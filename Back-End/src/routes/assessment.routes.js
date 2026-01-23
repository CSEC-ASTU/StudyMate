import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAssessmentSchema } from '../utils/validationSchemas.js';
import * as assessmentController from '../controllers/assessment.controller.js';

const router = express.Router();

router.post('/courses/:courseId/assessments', authenticate, validate(createAssessmentSchema), assessmentController.createAssessment);
router.get('/courses/:courseId/assessments', authenticate, assessmentController.getCourseAssessments);

export default router;
