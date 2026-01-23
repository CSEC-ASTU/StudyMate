import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSemesterAnalysis = async (semesterId, userId) => {
  // 1. Verify Semester Ownership
  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    include: { 
      courses: {
        include: {
          progress: true
        }
      }
    }
  });

  if (!semester || semester.userId !== userId) {
    return null;
  }

  const courses = semester.courses;
  const totalCourses = courses.length;

  if (totalCourses === 0) {
    // Empty analysis
    return prisma.semesterAnalysis.upsert({
      where: { semesterId },
      create: { semesterId, userId, totalCourses: 0, averageMark: 0, progressPercentage: 0 },
      update: { totalCourses: 0, averageMark: 0, progressPercentage: 0 }
    });
  }

  // 2. Aggregate Data
  let sumAverageMarks = 0;
  let sumProgress = 0;
  let coursesWithProgress = 0;

  for (const course of courses) {
    if (course.progress) {
      sumAverageMarks += course.progress.averageMark;
      sumProgress += course.progress.progressPercentage;
      coursesWithProgress++;
    }
  }

  // If no courses have progress, averages are 0
  const semesterAverageMark = coursesWithProgress > 0 ? (sumAverageMarks / totalCourses) : 0; 
  // Note: Dividing by totalCourses (not just those with progress) to reflect true semester standing? 
  // Usually average is over TOTAL courses. If I haven't started a course, my semester average drops? 
  // Let's stick to: Average of the courses that HAVE progress? 
  // Prompt: "Average marks across courses"
  // Let's do average across ALL courses (treating missing as 0? No, that punishes not starting).
  // Let's do average of *active* courses (coursesWithProgress). 
  // BUT the prompt says "Semester-level summary analysis".
  // Let's go with: Average of available marks.
  
  const effectiveAverageMark = coursesWithProgress > 0 ? (sumAverageMarks / coursesWithProgress) : 0;
  const effectiveProgress = (sumProgress / totalCourses); // Progress is definitely across all courses.

  // 3. Upsert Analysis
  return prisma.semesterAnalysis.upsert({
    where: { semesterId },
    create: {
      semesterId,
      userId,
      totalCourses,
      averageMark: effectiveAverageMark,
      progressPercentage: effectiveProgress,
    },
    update: {
      totalCourses,
      averageMark: effectiveAverageMark,
      progressPercentage: effectiveProgress,
    }
  });
};
