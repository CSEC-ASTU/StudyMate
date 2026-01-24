// app/components/pages/dashboard/CourseCard.tsx
"use client";

import { useState } from "react";
import { BookOpen, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseActionModal } from "./CourseModal";

interface CourseCardProps {
  id?: string;
  name: string;
  code: string;
  creditHours: number;
  instructor: string;
  progress: number;
  students: number;
  nextClass?: string;
}

export function CourseCard({
  id,
  name,
  code,
  creditHours,
  instructor,
  progress,
  students,
  nextClass,
}: CourseCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Format the course code if needed
  const formattedCode =
    code ||
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  // Default values for missing data
  const displayInstructor = instructor || "Not assigned";
  const displayProgress = Math.min(Math.max(progress || 0, 0), 100); // Ensure between 0-100
  const displayStudents = students || 0;

  return (
    <>
      <Card
        className="cursor-pointer border-border bg-background transition-all hover:shadow-md hover:border-primary/50"
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <Badge
              variant="none"
              className="border-secondary text-secondary font-bold"
            >
              {creditHours || 0} Credits
            </Badge>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{formattedCode}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Instructor:{" "}
            <span className="text-foreground">{displayInstructor}</span>
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {displayProgress}%
              </span>
            </div>
            <Progress value={displayProgress} className="h-2 bg-secondary" />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{displayStudents} students</span>
            </div>
            {nextClass && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{nextClass}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CourseActionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        courseName={name}
        courseId={id}
      />
    </>
  );
}
