// app/components/pages/dashboard/SemestersPage.tsx
"use client";

import { useState, useEffect } from "react";
import { SemesterCard } from "@/components/pages/dashboard/SemesterCard";
import { AddSemesterDialog } from "@/components/pages/dashboard/AddSemesterDialog";
import { Calendar } from "lucide-react";

const initialSemesters = [
  {
    id: "1",
    name: "Fall 2024",
    startDate: "2024-09-01T00:00:00.000Z",
    endDate: "2024-12-15T23:59:59.999Z",
    courseCount: 6,
    isActive: true,
  },
  {
    id: "2",
    name: "Spring 2024",
    startDate: "2024-01-15T00:00:00.000Z",
    endDate: "2024-05-10T23:59:59.999Z",
    courseCount: 5,
    isActive: false,
  },
  {
    id: "3",
    name: "Summer 2024",
    startDate: "2024-05-20T00:00:00.000Z",
    endDate: "2024-08-10T23:59:59.999Z",
    courseCount: 3,
    isActive: false,
  },
  {
    id: "4",
    name: "Fall 2023",
    startDate: "2023-09-01T00:00:00.000Z",
    endDate: "2023-12-15T23:59:59.999Z",
    courseCount: 6,
    isActive: false,
  },
];

export default function SemestersPage() {
  const [semesters] = useState(initialSemesters);
  const [loading, setLoading] = useState(false);

  // Fetch semesters from API on component mount
  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      // Uncomment to use real API
      // const token = localStorage.getItem("token");
      // const response = await fetch("/api/semesters", {
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterAdded = () => {
    // Refresh the semester list
    fetchSemesters();

    // Show success message
    console.log("Semester added successfully");

    // You could also show a toast notification here
    // toast({
    //   title: "Semester created",
    //   description: "Your new semester has been created successfully.",
    // });
  };

  // Determine which semester is currently active based on dates
  const getActiveSemester = () => {
    const now = new Date();
    return semesters.find((semester) => {
      const start = new Date(semester.startDate);
      const end = new Date(semester.endDate);
      return now >= start && now <= end;
    });
  };

  const activeSemester = getActiveSemester();

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Semesters</h1>
          <p className="text-muted-foreground">
            {activeSemester ? (
              <>
                Currently in{" "}
                <span className="font-semibold text-foreground">
                  {activeSemester.name}
                </span>{" "}
                • Total of{" "}
                <span className="font-semibold text-foreground">
                  {semesters.length} semesters
                </span>
              </>
            ) : (
              <>
                You have{" "}
                <span className="font-semibold text-foreground">
                  {semesters.length} semesters
                </span>{" "}
                in total
              </>
            )}
          </p>
        </div>
        <AddSemesterDialog onSemesterAdded={handleSemesterAdded} />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Semesters Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {semesters.map((semester) => (
              <SemesterCard
                key={semester.id}
                id={semester.id}
                name={semester.name}
                startDate={semester.startDate}
                endDate={semester.endDate}
                courseCount={semester.courseCount}
                isActive={semester.isActive}
              />
            ))}
          </div>

          {/* Empty State */}
          {semesters.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No semesters yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first semester to start organizing your courses
              </p>
              <AddSemesterDialog onSemesterAdded={handleSemesterAdded} />
            </div>
          )}

          {/* Info Note */}
          <div className="mt-6 rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Active
              semesters are highlighted in green. You can have multiple
              semesters to organize courses by academic terms.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
