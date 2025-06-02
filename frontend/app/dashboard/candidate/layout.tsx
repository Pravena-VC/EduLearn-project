"use client";

import { CandidateGuard } from "@/components/gaurds";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Award,
  BookCheck,
  BookCopy,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LetterText,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { clearUser } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname === path ? "bg-primary text-white" : "";

  return (
    <CandidateGuard>
      <SidebarProvider>
        <div className="flex h-screen w-screen">
          <Sidebar>
            <SidebarHeader className="border-b">
              <div className="flex items-center p-2">
                <Link href="/dashboard/candidate" className="w-full">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    EduLearn Student
                  </span>
                </Link>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate"
                          )}`}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Learning</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/personalized-learning"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate/personalized-learning"
                          )}`}
                        >
                          <BookCheck className="h-4 w-4" />
                          <span>Create Learning Path</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/blogs"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/blogs"
                          )}`}
                        >
                          <BookCopy className="h-4 w-4" />
                          <span>Notes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/courses"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate/courses"
                          )}`}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>My Courses</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/applications"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate/applications"
                          )}`}
                        >
                          <LetterText className="h-4 w-4" />
                          <span>Applications</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/certificates"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate/certificates"
                          )}`}
                        >
                          <Award className="h-4 w-4" />
                          <span>Certificates</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Browse</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/courses"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/courses"
                          )}`}
                        >
                          <GraduationCap className="h-4 w-4" />
                          <span>Explore Courses</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/dashboard/candidate/profile"
                          className={`flex items-center gap-2 p-2 rounded ${isActive(
                            "/dashboard/candidate/profile"
                          )}`}
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    <span>Student Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/candidate/profile"
                      className="flex items-center gap-2 p-2"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/candidate/settings"
                      className={`flex items-center gap-2 p-2 rounded ${isActive(
                        "/dashboard/candidate/settings"
                      )}`}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto">{children}</div>
          </div>
        </div>
      </SidebarProvider>
    </CandidateGuard>
  );
}
