// app/components/pages/dashboard/AddCourseDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { create } from "zustand";
import { z } from "zod";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

// Zod validation schema
const courseSchema = z.object({
  name: z
    .string()
    .min(1, "Course name is required")
    .max(100, "Course name is too long"),
  creditHours: z.number().min(1).max(6, "Credit hours must be between 1 and 6"),
  semesterId: z.string().min(1, "Semester is required"),
});

interface CourseStore {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
}

const useCourseStore = create<CourseStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}));

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    courses: number;
  };
}

interface AddCourseDialogProps {
  onCourseAdded?: () => void;
  semesterId?: string;
}

export function AddCourseDialog({
  onCourseAdded,
  semesterId: propSemesterId,
}: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    creditHours: 3,
    semesterId: propSemesterId || "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string>("");
  const { errors, setErrors, clearErrors } = useCourseStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch semesters on dialog open
  useEffect(() => {
    if (open) {
      fetchSemesters();
    }
  });

  // Get semesterId from URL if not provided as prop
  useEffect(() => {
    if (!propSemesterId) {
      const urlSemesterId = searchParams.get("semesterId");
      if (urlSemesterId) {
        setFormData((prev) => ({ ...prev, semesterId: urlSemesterId }));
      }
    }
  }, [searchParams, propSemesterId]);

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      console.log("Fetching semesters with token:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/semesters`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Semesters API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched semesters:", data);
        setSemesters(data);

        // If no semester is selected but we have semesters, select the first one
        if (!formData.semesterId && data.length > 0) {
          setFormData((prev) => ({ ...prev, semesterId: data[0].id }));
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch semesters:", errorText);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "creditHours" ? Number(value) : value,
    }));

    if (apiError) setApiError("");

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string, value: string | number) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateField = (field: string, value: string | number) => {
    try {
      if (field === "name") {
        if (
          !value ||
          (typeof value === "string" && value.trim().length === 0)
        ) {
          setErrors({ ...errors, name: "Course name is required" });
        } else if (typeof value === "string" && value.length > 100) {
          setErrors({ ...errors, name: "Course name is too long" });
        } else {
          const newErrors = { ...errors };
          delete newErrors.name;
          setErrors(newErrors);
        }
      } else if (field === "creditHours") {
        const numValue = Number(value);
        if (numValue < 1 || numValue > 6) {
          setErrors({
            ...errors,
            creditHours: "Credit hours must be between 1 and 6",
          });
        } else {
          const newErrors = { ...errors };
          delete newErrors.creditHours;
          setErrors(newErrors);
        }
      } else if (field === "semesterId") {
        if (!value) {
          setErrors({ ...errors, semesterId: "Please select a semester" });
        } else {
          const newErrors = { ...errors };
          delete newErrors.semesterId;
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const validateForm = () => {
    try {
      courseSchema.parse(formData);
      clearErrors();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      name: true,
      creditHours: true,
      semesterId: true,
    };
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Find the selected semester name for logging
      const selectedSemester = semesters.find(
        (s) => s.id === formData.semesterId,
      );
      console.log("Creating course for semester:", selectedSemester?.name);

      // Send POST request to create course in the selected semester
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/semesters/${formData.semesterId}/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            creditHours: formData.creditHours,
          }),
        },
      );

      const data = await response.json();
      console.log("Course creation response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create course",
        );
      }

      console.log("Course created successfully:", data);

      // Reset form and close dialog
      setFormData({
        name: "",
        creditHours: 3,
        semesterId: propSemesterId || formData.semesterId || "",
      });
      setOpen(false);
      clearErrors();
      setTouched({});

      // Callback to refresh course list
      if (onCourseAdded) {
        onCourseAdded();
      }

      // Refresh the page or navigate if needed
      if (pathname.includes("/courses")) {
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Error creating course:", error);
      if (error instanceof Error) {
        setApiError(
          error.message || "Failed to create course. Please try again.",
        );
      } else {
        setApiError("Failed to create course. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Reset form when dialog closes (but keep semesterId if provided)
          setFormData({
            name: "",
            creditHours: 3,
            semesterId: propSemesterId || formData.semesterId || "",
          });
          clearErrors();
          setTouched({});
          setApiError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to your semester. Click create when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive text-center">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Course Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Data Structures"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name", formData.name)}
                disabled={loading}
                className={`${errors.name ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50"}`}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="creditHours"
                className="text-sm font-medium text-foreground"
              >
                Credit Hours
              </Label>
              <Select
                value={formData.creditHours.toString()}
                onValueChange={(value) => {
                  handleChange("creditHours", parseInt(value));
                  handleBlur("creditHours", parseInt(value));
                }}
                disabled={loading}
              >
                <SelectTrigger
                  className={`${errors.creditHours ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50"}`}
                >
                  <SelectValue placeholder="Select credit hours" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((hours) => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} credit hour{hours !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.creditHours && (
                <p className="text-xs text-destructive mt-1">
                  {errors.creditHours}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="semester"
                className="text-sm font-medium text-foreground"
              >
                Semester
              </Label>
              <Select
                value={formData.semesterId}
                onValueChange={(value) => {
                  handleChange("semesterId", value);
                  handleBlur("semesterId", value);
                }}
                disabled={loading || (!!propSemesterId && semesters.length > 0)}
              >
                <SelectTrigger
                  className={`${errors.semesterId ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50"}`}
                >
                  <SelectValue placeholder="Select a semester">
                    {formData.semesterId && semesters.length > 0
                      ? semesters.find((s) => s.id === formData.semesterId)
                          ?.name
                      : "Select a semester"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading semesters...
                    </SelectItem>
                  ) : semesters.length === 0 ? (
                    <SelectItem value="no-semesters" disabled>
                      No semesters available
                    </SelectItem>
                  ) : (
                    semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} ({semester._count.courses} courses)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.semesterId && (
                <p className="text-xs text-destructive mt-1">
                  {errors.semesterId}
                </p>
              )}
              {propSemesterId && semesters.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Course will be added to the current semester
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                Object.keys(errors).length > 0 ||
                !formData.semesterId
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
