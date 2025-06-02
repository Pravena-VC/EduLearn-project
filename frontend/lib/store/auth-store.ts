import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  username: string;
  email: string;
  role: "student" | "staff";
  staff_id?: string;
  token?: string;
  bio?: string;
  profile_picture?: string;
}

interface AuthStore {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: "auth-store",
    }
  )
);
