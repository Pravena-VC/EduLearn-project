"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useEffect } from "react";

export function AuthInitializer() {
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    setInitialized();
  }, [setInitialized]);

  return null;
}
