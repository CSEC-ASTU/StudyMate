import { Router } from 'express';
import * as courseController from '../controllers/course.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Direct Course Routes
router.get('/:id', courseController.get);

export default router;
