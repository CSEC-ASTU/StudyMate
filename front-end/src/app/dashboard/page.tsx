"use client";

import { BookOpen, Clock, GraduationCap, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/pages/dashboard/StatusCard";
import { CourseCard } from "@/components/pages/dashboard/CourseCard";
import { ScheduleCard } from "@/components/pages/dashboard/ScheduleCard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Calculate stats from real data
  const activeCourses = data.courses.length;
  const totalCredits = data.courses.reduce(
    (sum, course) => sum + (course.creditHours || 0),
    0
  );
  const averageProgress = data.analysis?.averageProgress || 
    (data.analysis?.overallProgress ?? 0);

  // Transform upcoming assessments for schedule display
  const todaySchedule = (data.analysis?.upcomingAssessments || [])
    .slice(0, 5)
    .map((assessment) => ({
      time: new Date(assessment.dueDate).toLocaleDateString(),
      title: assessment.title,
      type: "assignment" as const,
    }));

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Active Courses"
          value={activeCourses}
          description="This semester"
          icon={BookOpen}
        />
        <StatsCard
          title="Total Credits"
          value={totalCredits}
          description="Enrolled credits"
          icon={GraduationCap}
        />
        <StatsCard
          title="Study Hours"
          value="24h"
          description="This week"
          icon={Clock}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Average Progress"
          value={`${Math.round(averageProgress)}%`}
          description="Course completion"
          icon={TrendingUp}
          trend={{ value: 5, positive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courses Section */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Courses
            </h2>
            <a href="/dashboard/courses" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          
          {data.courses.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg border border-border">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding courses to your semester
              </p>
              <a
                href="/dashboard/courses"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Add Course
              </a>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {data.courses.slice(0, 4).map((course) => {
                const progress = data.courseProgress[course.id];
                return (
                  <CourseCard
                    key={course.id}
                    name={course.name}
                    code={course.code}
                    creditHours={course.creditHours || 0}
                    instructor={course.instructor || "TBA"}
                    progress={progress?.progress || 0}
                    students={0} // Not available from API
                    nextClass="TBA" // Not available from API
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div>
          <ScheduleCard items={todaySchedule.length > 0 ? todaySchedule : [
            {
              time: "No upcoming events",
              title: "Your schedule is clear",
              type: "lecture" as const,
            },
          ]} />
        </div>
      </div>
    </main>
  );
}
