import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCourse = async (userId, semesterId, data) => {
  // Verify semester belongs to user
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, userId },
  });

  if (!semester) {
    throw new Error('Semester not found or access denied');
  }

  return prisma.course.create({
    data: {
      ...data,
      semesterId,
      userId,
    },
  });
};

export const getSemesterCourses = async (userId, semesterId) => {
  // Verify semester belongs to user
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, userId },
  });

  if (!semester) {
    return null;
  }

  return prisma.course.findMany({
    where: { semesterId },
    orderBy: { createdAt: 'asc' },
  });
};

export const getCourseById = async (userId, courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { semester: true },
  });

  if (!course || course.userId !== userId) {
    return null;
  }

  return course;
};
