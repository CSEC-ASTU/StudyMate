"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/pages/dashboard/CourseCard"

const allCourses = [
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
  {
    name: "Database Management Systems",
    code: "CS301",
    creditHours: 3,
    instructor: "Dr. Robert Williams",
    progress: 35,
    students: 41,
    nextClass: "Thu, 11:00 AM",
  },
  {
    name: "Software Engineering",
    code: "CS350",
    creditHours: 4,
    instructor: "Prof. Lisa Anderson",
    progress: 55,
    students: 36,
    nextClass: "Fri, 9:00 AM",
  },
  {
    name: "Machine Learning Basics",
    code: "CS401",
    creditHours: 3,
    instructor: "Dr. James Wilson",
    progress: 20,
    students: 48,
    nextClass: "Mon, 3:00 PM",
  },
]

export default function CoursesPage() {
  return (
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Header Actions */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                You are enrolled in <span className="font-semibold text-foreground">{allCourses.length} courses</span> this semester
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCourses.map((course) => (
              <CourseCard key={course.code} {...course} />
            ))}
          </div>

          {/* Info Note */}
          <div className="mt-6 rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Click on any course to access livestream, take exams, or study with our AI assistant.
            </p>
          </div>
        </main>
  )
}
