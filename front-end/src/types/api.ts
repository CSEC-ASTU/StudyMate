// API Response Types

export interface User {
  id: string;
  fullName: string;
  email: string;
  educationLevel?: string;
  institutionName?: string;
  university?: string;
  department?: string;
  program?: string;
  yearOrSemester?: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  creditHours?: number;
  instructor?: string;
  semesterId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  weight?: number;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseProgress {
  progress: number;
  completedTopics: number;
  totalTopics: number;
  courseId?: string;
}

export interface SemesterAnalysis {
  overallProgress: number;
  coursesCount: number;
  upcomingAssessments: Assessment[];
  totalCredits?: number;
  averageProgress?: number;
}

// Request Types

export interface CreateSemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  creditHours?: number;
  instructor?: string;
}

export interface CreateAssessmentRequest {
  title: string;
  type: string;
  dueDate: string;
  weight?: number;
}
