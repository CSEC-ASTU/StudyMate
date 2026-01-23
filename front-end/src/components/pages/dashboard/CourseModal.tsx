"use client";

import { Video, FileText, Bot, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CourseActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
}

const actions = [
  {
    title: "Start Livestream",
    description: "Join a live class session with your instructor",
    icon: Video,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Exam or Quiz",
    description: "Take an exam or practice quiz for this course",
    icon: FileText,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "Study with Assistant",
    description: "Get AI-powered help with your coursework",
    icon: Bot,
    color: "bg-foreground text-background",
  },
];

export function CourseActionModal({
  open,
  onOpenChange,
  courseName,
}: CourseActionModalProps) {
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
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary"
              onClick={() => onOpenChange(false)}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}
              >
                <action.icon className="h-6 w-6" />
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

        <Button
          variant="outline"
          className="w-full border-border text-muted-foreground hover:bg-secondary bg-transparent"
          onClick={() => onOpenChange(false)}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
