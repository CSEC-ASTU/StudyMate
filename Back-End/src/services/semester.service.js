import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSemester = async (userId, data) => {
  return prisma.semester.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getUserSemesters = async (userId) => {
  return prisma.semester.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
    include: { _count: { select: { courses: true } } }
  });
};

export const getSemesterById = async (userId, semesterId) => {
  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    include: { courses: true },
  });

  if (!semester || semester.userId !== userId) {
    return null;
  }

  return semester;
};

export const deleteSemester = async (userId, semesterId) => {
  // Ensure ownership before deleting
  const count = await prisma.semester.count({
    where: { id: semesterId, userId },
  });

  if (count === 0) {
    return null;
  }

  return prisma.semester.delete({
    where: { id: semesterId },
  });
};
