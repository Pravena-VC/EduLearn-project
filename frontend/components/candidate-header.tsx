"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CandidateHeader() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const getInitials = () => {
    if (!user) return "";
    if (user.username) {
      const parts = user.username.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.username.slice(0, 2).toUpperCase();
    }
    return user.email?.slice(0, 2).toUpperCase() || "";
  };

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur sticky top-[0px] z-40">
      <div className="mx-auto flex items-center justify-end px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none focus:ring-2 focus:ring-primary rounded-full">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user?.profile_picture || undefined}
                  alt="Avatar"
                />
                <AvatarFallback>
                  {getInitials() || (
                    <User2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/candidate/profile">
                <User2 className="w-4 h-4 mr-2" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
