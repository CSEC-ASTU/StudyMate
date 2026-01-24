// app/components/pages/dashboard/AddSemesterDialog.tsx
"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { z } from "zod";

// Zod validation schema
const semesterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Semester name is required")
      .max(50, "Semester name is too long"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

interface SemesterStore {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
}

const useSemesterStore = create<SemesterStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}));

interface AddSemesterDialogProps {
  onSemesterAdded?: () => void;
}

export function AddSemesterDialog({ onSemesterAdded }: AddSemesterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string>("");
  const { errors, setErrors, clearErrors } = useSemesterStore();

  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (apiError) setApiError("");

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string, value: string | Date) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateField = (field: string, value: string | Date) => {
    try {
      if (field === "name") {
        if (
          !value ||
          (typeof value === "string" && value.trim().length === 0)
        ) {
          setErrors({ ...errors, name: "Semester name is required" });
        } else if (typeof value === "string" && value.length > 50) {
          setErrors({ ...errors, name: "Semester name is too long" });
        } else {
          const newErrors = { ...errors };
          delete newErrors.name;
          setErrors(newErrors);
        }
      } else if (field === "startDate" || field === "endDate") {
        if (!value) {
          setErrors({
            ...errors,
            [field]: `${field === "startDate" ? "Start" : "End"} date is required`,
          });
        } else {
          const newErrors = { ...errors };
          delete newErrors[field];
          setErrors(newErrors);

          // Validate date relationship if both dates are set
          if (formData.startDate && formData.endDate && field === "endDate") {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end <= start) {
              setErrors({
                ...errors,
                endDate: "End date must be after start date",
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const validateForm = () => {
    try {
      const formattedData = {
        name: formData.name,
        startDate: formData.startDate
          ? formatDateToISO(formData.startDate)
          : "",
        endDate: formData.endDate
          ? formatDateToISO(formData.endDate, true)
          : "",
      };

      semesterSchema.parse(formattedData);
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

  const formatDateToISO = (date: Date, isEndDate: boolean = false) => {
    const newDate = new Date(date);
    if (isEndDate) {
      newDate.setHours(23, 59, 59, 999);
    } else {
      newDate.setHours(0, 0, 0, 0);
    }
    return newDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      name: true,
      startDate: true,
      endDate: true,
    };
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    if (!formData.startDate || !formData.endDate) {
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

      // Format dates to ISO string
      const startDate = formatDateToISO(formData.startDate);
      const endDate = formatDateToISO(formData.endDate, true);

      // Send POST request to the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/semesters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            startDate: startDate,
            endDate: endDate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create semester",
        );
      }

      console.log("Semester created:", data);

      // Reset form and close dialog
      setFormData({
        name: "",
        startDate: undefined,
        endDate: undefined,
      });
      setOpen(false);
      clearErrors();
      setTouched({});

      // Callback to refresh semester list
      if (onSemesterAdded) {
        onSemesterAdded();
      }
    } catch (error: unknown) {
      console.error("Error creating semester:", error);
      if (error instanceof Error) {
        setApiError(
          error.message || "Failed to create semester. Please try again.",
        );
      } else {
        setApiError("Failed to create semester. Please try again.");
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
          // Reset form when dialog closes
          setFormData({
            name: "",
            startDate: undefined,
            endDate: undefined,
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
          Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Semester</DialogTitle>
          <DialogDescription>
            Add a new semester with start and end dates.
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
                Semester Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Fall 2024, Spring 2025"
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
                htmlFor="startDate"
                className="text-sm font-medium text-foreground"
              >
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                      errors.startDate
                        ? "border-destructive focus:ring-destructive/50"
                        : "border-border focus:ring-primary/50",
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      handleChange("startDate", date as Date);
                      handleBlur("startDate", date as Date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-xs text-destructive mt-1">
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-foreground"
              >
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                      errors.endDate
                        ? "border-destructive focus:ring-destructive/50"
                        : "border-border focus:ring-primary/50",
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      handleChange("endDate", date as Date);
                      handleBlur("endDate", date as Date);
                    }}
                    initialFocus
                    disabled={(date) =>
                      formData.startDate ? date < formData.startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-xs text-destructive mt-1">
                  {errors.endDate}
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
              disabled={loading || Object.keys(errors).length > 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Creating...
                </>
              ) : (
                "Create Semester"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
