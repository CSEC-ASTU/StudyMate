import { Router } from 'express';
import * as semesterController from '../controllers/semester.controller.js';
import * as courseController from '../controllers/course.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSemesterSchema, createCourseSchema } from '../utils/validationSchemas.js';

const router = Router();

router.use(authenticate);

// Semester Routes
router.post('/', validate(createSemesterSchema), semesterController.create);
router.get('/', semesterController.list);
router.get('/:id', semesterController.get);
router.delete('/:id', semesterController.remove);

// Indirect Course Routes (via Semester)
router.post('/:id/courses', validate(createCourseSchema), courseController.create);
router.get('/:id/courses', courseController.listBySemester);

export default router;
