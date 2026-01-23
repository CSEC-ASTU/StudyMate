import express from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { signupSchema, loginSchema } from '../utils/validationSchemas.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signupHandler);
router.post('/login', validate(loginSchema), authController.loginHandler);

export default router;
