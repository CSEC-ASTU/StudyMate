import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { onboardingStep1Schema, onboardingStep2Schema } from '../utils/validationSchemas.js';
import * as profileController from '../controllers/profile.controller.js';

const router = express.Router();

router.post(
  '/onboarding/step1',
  authenticate,
  validate(onboardingStep1Schema),
  profileController.updateStep1Handler
);

router.post(
  '/onboarding/step2',
  authenticate,
  validate(onboardingStep2Schema),
  profileController.updateStep2Handler
);

export default router;
