import { PrismaClient } from '@prisma/client';
import { updateCourseProgress } from './courseProgress.service.js';

const prisma = new PrismaClient();

export const createAssessment = async (courseId, userId, data) => {
  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Create Assessment
  const assessment = await prisma.assessment.create({
    data: {
      ...data,
      courseId,
      userId,
    },
  });

  // Recalculate Course Progress
  await updateCourseProgress(courseId);

  return assessment;
};

export const getCourseAssessments = async (courseId, userId) => {
  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.userId !== userId) {
    throw new Error('Course not found or unauthorized');
  }

  return prisma.assessment.findMany({
    where: { courseId },
    orderBy: { takenAt: 'desc' },
  });
};
