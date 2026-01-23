import { z } from 'zod';

export const materialUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  universityName: z.string().min(1, 'University name is required'),
  courseName: z.string().min(1, 'Course name is required'),
  keywords: z.string().optional(),
  courseId: z.string().uuid('Invalid course ID'),
  isGlobal: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
});
