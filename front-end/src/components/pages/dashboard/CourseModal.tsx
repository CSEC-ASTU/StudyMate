"use client";

import { Video, FileText, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourseActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  courseId?: string; 
}

const actions = [
  {
    title: "Start Livestream",
    description: "Join a live class session with your instructor",
    icon: Video,
    color: "border border-secondary text-primary-foreground",
    path: "/livestream",
  },
  {
    title: "Exam or Quiz",
    description: "Take an exam or practice quiz for this course",
    icon: FileText,
    color: "border border-secondary  text-primary-foreground",
    path: "/dashboard/courses/#",
  },
  {
    title: "Study with Assistant",
    description: "Get AI-powered help with your coursework",
    icon: Bot,
    color: "border border-secondary  text-primary-foreground",
    path: "/dashboard/courses/#", 
  },
];

export function CourseActionModal({
  open,
  onOpenChange,
  courseName,
  courseId,
}: CourseActionModalProps) {
  const router = useRouter();

  const handleActionClick = (path: string) => {
    onOpenChange(false);
    const finalPath = courseId ? `${path}?courseId=${courseId}` : path;
    router.push(finalPath);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{courseName}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose what you&apos;d like to do with this course
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {actions.map((action) => (
            <button
              key={action.title}
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:cursor-pointer hover:bg-secondary/20"
              onClick={() => handleActionClick(action.path)}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}
              >
                <action.icon className="h-7 w-7 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
