"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/pages/dashboard/Sidebar";
import { Header } from "@/components/pages/dashboard/Header";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Function to get title and subtitle based on current path
  const getHeaderContent = () => {
    if (pathname === "/dashboard/courses") {
      return {
        title: "Courses",
        subtitle: "Manage and view your courses",
      };
    } else if (pathname === "/dashboard/semesters") {
      return {
        title: "Semesters",
        subtitle: "Manage your academic terms",
      };
    } else if (pathname === "/dashboard/settings") {
      return {
        title: "Settings",
        subtitle: "Manage your account preferences",
      };
    } else if (
      pathname === "/dashboard/profile" ||
      pathname.startsWith("/dashboard/profile/")
    ) {
      return {
        title: "Profile",
        subtitle: "Manage your account settings",
      };
    } else {
      return {
        title: "Dashboard",
        subtitle: "Welcome back, John!",
      };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header title={headerContent.title} subtitle={headerContent.subtitle} />
        <main className="flex-1 overflow-auto bg-secondary/20 dark:bg-secondary/10 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
