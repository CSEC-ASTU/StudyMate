"use client"

import { useState } from "react"
import { BookOpen, Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CourseActionModal } from "./CourseModal"

interface CourseCardProps {
  name: string
  code: string
  creditHours: number
  instructor: string
  progress: number
  students: number
  nextClass?: string
}

export function CourseCard({
  name,
  code,
  creditHours,
  instructor,
  progress,
  students,
  nextClass,
}: CourseCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

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
            <Badge variant="none" className="border-secondary text-secondary font-bold">
              {creditHours} Credits
            </Badge>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{code}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Instructor: <span className="text-foreground">{instructor}</span>
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary" />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{students} students</span>
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
      />
    </>
  )
}
