// app/components/pages/dashboard/CoursesPage.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { CourseCard } from "@/components/pages/dashboard/CourseCard";
import { AddCourseDialog } from "@/components/pages/dashboard/AddCourseDialog";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  instructor: string;
  progress: number;
  students: number;
  nextClass?: string;
  semesterId: string;
}

interface Semester {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    courses: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const semesterId = searchParams.get("semesterId");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // If no semesterId is provided, we need to get the current/active semester first
      let targetSemesterId = semesterId;

      if (!targetSemesterId) {
        // First, fetch semesters to find the active one
        const semestersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/semesters`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!semestersResponse.ok) {
          throw new Error("Failed to fetch semesters");
        }

        const semesters: Semester[] = await semestersResponse.json();

        // Find the most recent semester (based on start date) or use the first one
        const getMostRecentSemester = (semestersList: Semester[]) => {
          if (semestersList.length === 0) return null;

          return semestersList.reduce((recent, current) => {
            const recentDate = new Date(recent.startDate);
            const currentDate = new Date(current.startDate);
            return currentDate > recentDate ? current : recent;
          });
        };

        const mostRecentSemester =
          getMostRecentSemester(semesters) || semesters[0];

        if (!mostRecentSemester) {
          setCourses([]);
          setLoading(false);
          return;
        }

        targetSemesterId = mostRecentSemester.id;
      }

      // Now fetch courses for the specific semester
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/semesters/${targetSemesterId}/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load courses",
      );
    } finally {
      setLoading(false);
    }
  }, [semesterId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseAdded = () => {
    // Refresh the course list
    fetchCourses();

    // Show success message (you could add a toast here)
    console.log("Course added successfully");
  };

  // Loading skeleton component
  const CourseSkeleton = () => (
    <Suspense>
      <Card className="border-border bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    </Suspense>
  );

  if (loading) {
    return (
      <Suspense>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
              <p className="text-muted-foreground">
                <Skeleton className="h-4 w-48" />
              </p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        </main>
      </Suspense>
    );
  }

  if (error) {
    return (
      <Suspense>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
              <p className="text-muted-foreground">Error loading courses</p>
            </div>
            <AddCourseDialog
              onCourseAdded={handleCourseAdded}
              semesterId={semesterId || undefined}
            />
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-destructive mb-2">Error: {error}</p>
            <button
              onClick={fetchCourses}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </Suspense>
    );
  }

  return (
    <Suspense>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              {semesterId ? (
                <>Courses for selected semester</>
              ) : (
                <>
                  You are enrolled in{" "}
                  <span className="font-semibold text-foreground">
                    {courses.length} courses
                  </span>{" "}
                  this semester
                </>
              )}
            </p>
          </div>
          <AddCourseDialog
            onCourseAdded={handleCourseAdded}
            semesterId={semesterId || undefined}
          />
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
            <p className="text-sm text-muted-foreground">
              {semesterId
                ? "This semester doesn't have any courses yet. Add your first course!"
                : "You haven't enrolled in any courses yet. Add your first course!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  code={course.code}
                  creditHours={course.creditHours}
                  instructor={course.instructor}
                  progress={course.progress}
                  students={course.students}
                  nextClass={course.nextClass}
                />
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> Click
                on any course to access livestream, take exams, or study with
                our AI assistant.
              </p>
            </div>
          </>
        )}
      </main>
    </Suspense>
  );
}
