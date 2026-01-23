import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const onboardingStep1Schema = z.object({
  body: z.object({
    educationLevel: z.string(),
    institutionName: z.string(),
  }),
});

export const onboardingStep2Schema = z.object({
  body: z.object({
    university: z.string().optional(),
    department: z.string().optional(),
    program: z.string().optional(),
    yearOrSemester: z.string().optional(),
  }),
});
