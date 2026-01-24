'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type {
  Semester,
  Course,
  SemesterAnalysis,
  CourseProgress
} from '@/types/api';

export interface DashboardData {
  semesters: Semester[];
  currentSemester: Semester | null;
  courses: Course[];
  analysis: SemesterAnalysis | null;
  courseProgress: Record<string, CourseProgress>;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    semesters: [],
    currentSemester: null,
    courses: [],
    analysis: null,
    courseProgress: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all semesters
        const semesters = await apiGet<Semester[]>('/api/semesters');

        if (semesters.length === 0) {
          setData({
            semesters: [],
            currentSemester: null,
            courses: [],
            analysis: null,
            courseProgress: {},
          });
          setIsLoading(false);
          return;
        }

        // Get the most recent semester (assuming it's the first one or sort by date)
        const currentSemester = semesters[0];

        // Fetch courses for current semester
        const courses = await apiGet<Course[]>(
          `/api/semesters/${currentSemester.id}/courses`
        );

        // Fetch semester analysis
        const analysis = await apiGet<SemesterAnalysis>(
          `/api/semesters/${currentSemester.id}/analysis`
        );

        // Fetch progress for each course
        const progressPromises = courses.map(async (course) => {
          try {
            const progress = await apiGet<CourseProgress>(
              `/api/courses/${course.id}/progress`
            );
            return { courseId: course.id, progress };
          } catch (err) {
            console.error(`Failed to fetch progress for course ${course.id}:`, err);
            return {
              courseId: course.id,
              progress: { progress: 0, completedTopics: 0, totalTopics: 0 },
            };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const courseProgress: Record<string, CourseProgress> = {};
        progressResults.forEach(({ courseId, progress }) => {
          courseProgress[courseId] = progress;
        });

        setData({
          semesters,
          currentSemester,
          courses,
          analysis,
          courseProgress,
        });
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    // Trigger re-fetch by calling the same logic
    window.location.reload();
  };

  return { data, isLoading, error, refetch };
}
