"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import React from "react";
import { AuthInitializer } from "./auth-initializer";
import Footer from "./footer";
import Header from "./header";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
      </QueryClientProvider>
      <Toaster
        position="top-right"
        richColors={true}
        expand={true}
        duration={10000}
        closeButton={true}
        toastOptions={{
          classNames: {
            closeButton: "right-0 top-0 absolute",
          },
        }}
      />
    </ThemeProvider>
  );
}

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <Header />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <Footer />}
    </div>
  );
}
