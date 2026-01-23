"use client";

import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const profileData = {
  name: "John Doe",
  email: "john.doe@university.edu",
  phone: "+1 (555) 123-4567",
  location: "New York, USA",
  educationLevel: "Undergraduate",
  institution: "State University",
  department: "Computer Science",
  enrollmentYear: "2023",
  studentId: "STU-2023-0542",
  gpa: "3.75",
  totalCredits: 48,
  completedCourses: 16,
};

export default function ProfilePage() {
  return (
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="border-border bg-background lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src="/placeholder-avatar.jpg"
                        alt={profileData.name}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-foreground">
                    {profileData.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profileData.department}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {profileData.studentId}
                  </p>

                  <Separator className="my-4" />

                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {profileData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {profileData.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {profileData.location}
                      </span>
                    </div>
                  </div>

                  <Button className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Academic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Profile */}
              <Card className="border-border bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <GraduationCap className="h-5 w-5" />
                    Academic Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Education Level
                      </p>
                      <p className="font-medium text-foreground">
                        {profileData.educationLevel}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Institution
                      </p>
                      <p className="font-medium text-foreground">
                        {profileData.institution}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Department
                      </p>
                      <p className="font-medium text-foreground">
                        {profileData.department}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Enrollment Year
                      </p>
                      <p className="font-medium text-foreground">
                        {profileData.enrollmentYear}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Stats */}
              <Card className="border-border bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-5 w-5" />
                    Academic Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {profileData.gpa}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current GPA
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {profileData.totalCredits}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Credits
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {profileData.completedCourses}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Courses Completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Institution Info */}
              <Card className="border-border bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Building className="h-5 w-5" />
                    Institution Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {profileData.institution}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Primary Institution
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Building className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
  );
}
