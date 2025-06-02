"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: "student" | "staff" | "all";
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRole,
  redirectTo = "/login",
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until auth store is fully initialized before making any decisions
    if (!isInitialized) {
      return;
    }

    if (!user || !user.token) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRole === "all" || user.role === allowedRole) {
      setIsAuthorized(true);
    } else {
      if (user.role === "student") {
        router.replace("/dashboard/candidate");
      } else if (user.role === "staff") {
        router.replace("/dashboard/instructor");
      } else {
        router.replace(redirectTo);
      }
    }

    setIsLoading(false);
  }, [user, allowedRole, redirectTo, router, isInitialized]);

  // Show loading state while auth is initializing or authorizing
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}

export function InstructorGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="staff" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

export function CandidateGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="student" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

export function AuthGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="all" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}
