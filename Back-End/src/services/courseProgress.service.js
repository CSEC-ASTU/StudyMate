import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateCourseProgress = async (courseId) => {
  // 1. Fetch all assessments for the course
  const assessments = await prisma.assessment.findMany({
    where: { courseId },
  });

  if (assessments.length === 0) {
    // Reset progress if no assessments
    return prisma.courseProgress.upsert({
      where: { courseId },
      create: { 
        courseId,
        averageMark: 0,
        lastMark: 0,
        quizzesTaken: 0,
        testsTaken: 0,
        examsTaken: 0,
        progressPercentage: 0
      },
      update: {
        averageMark: 0,
        lastMark: 0,
        quizzesTaken: 0,
        testsTaken: 0,
        examsTaken: 0,
        progressPercentage: 0
      }
    });
  }

  // 2. Calculate Stats
  let totalMarks = 0;
  let totalMaxMarks = 0;
  let quizCount = 0;
  let testCount = 0;
  let examCount = 0;

  // Sort by takenAt to find last mark
  assessments.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
  const lastAssessment = assessments[assessments.length - 1];
  const lastMark = lastAssessment.mark; // Raw mark (or percentage? Logic said mark) -> Prompt said "averageMark", "lastMark". I will store raw last mark.

  for (const a of assessments) {
    totalMarks += a.mark;
    totalMaxMarks += a.maxMark;

    if (a.type === 'quiz') quizCount++;
    if (a.type === 'test') testCount++;
    if (a.type === 'exam') examCount++;
  }

  // Avoid division by zero
  const averageMark = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
  
  // Progress Percentage Logic:
  // "Based on number of assessments taken -> Keep logic simple"
  // Let's assume progress is capped at 100%, and each assessment adds some progress? 
  // OR, simpler: Progress defined by user doesn't exist. 
  // Let's make it: (assessments taken / arbitrary goal) * 100?
  // User Prompt: "Based on number of assessments taken"
  // Let's say 10 assessments = 100%? Or just return the raw count-based progress?
  // Let's use a simple heuristic: 5 quizzes + 2 tests + 1 exam = 100%?
  // Actually, let's keep it very simple: 
  // Progress = (total assessments / 10) * 100, capped at 100.
  
  const totalAssessments = quizCount + testCount + examCount;
  const progressPercentage = Math.min(100, (totalAssessments / 10) * 100);

  // 3. Upsert CourseProgress
  return prisma.courseProgress.upsert({
    where: { courseId },
    create: {
      courseId,
      averageMark,
      lastMark,
      quizzesTaken: quizCount,
      testsTaken: testCount,
      examsTaken: examCount,
      progressPercentage
    },
    update: {
      averageMark,
      lastMark,
      quizzesTaken: quizCount,
      testsTaken: testCount,
      examsTaken: examCount,
      progressPercentage
    }
  });
};

export const getCourseProgress = async (courseId, userId) => {
  // Check ownership implies checking the course first
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { progress: true }
  });

  if (!course || course.userId !== userId) {
    return null;
  }

  return course.progress;
};
