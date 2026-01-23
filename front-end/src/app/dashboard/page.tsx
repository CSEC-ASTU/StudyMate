"use client";

import { BookOpen, Clock, GraduationCap, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/pages/dashboard/StatusCard";
import { CourseCard } from "@/components/pages/dashboard/CourseCard";
import { ScheduleCard } from "@/components/pages/dashboard/ScheduleCard";

const courses = [
  {
    name: "Introduction to Computer Science",
    code: "CS101",
    creditHours: 3,
    instructor: "Dr. Sarah Johnson",
    progress: 65,
    students: 45,
    nextClass: "Today, 2:00 PM",
  },
  {
    name: "Data Structures & Algorithms",
    code: "CS201",
    creditHours: 4,
    instructor: "Prof. Michael Chen",
    progress: 42,
    students: 38,
    nextClass: "Tomorrow",
  },
  {
    name: "Web Development Fundamentals",
    code: "CS150",
    creditHours: 3,
    instructor: "Ms. Emily Davis",
    progress: 78,
    students: 52,
    nextClass: "Wed, 10:00 AM",
  },
];

const todaySchedule = [
  {
    time: "9:00 AM - 10:30 AM",
    title: "Web Development Lecture",
    type: "lecture" as const,
  },
  { time: "2:00 PM - 3:30 PM", title: "CS101 Quiz", type: "quiz" as const },
  {
    time: "5:00 PM",
    title: "Assignment Due: Data Structures",
    type: "assignment" as const,
  },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Active Courses"
          value={6}
          description="This semester"
          icon={BookOpen}
        />
        <StatsCard
          title="Total Credits"
          value={18}
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
          value="62%"
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.code} {...course} />
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <ScheduleCard items={todaySchedule} />
        </div>
      </div>
    </main>
  );
}
