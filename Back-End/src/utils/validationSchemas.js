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

export const createSemesterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  }),
});

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    creditHours: z.number().nonnegative().optional().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  }),
});
