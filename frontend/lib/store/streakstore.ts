import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StreakDay {
  date: string;
  count: number;
}

interface Streak {
  streak: number;
  lastStreakDate: Date | null;
  loginDates: StreakDay[];
  currentWeekDays: StreakDay[];

  setStreak: (streak: number) => void;
  setLastStreakDate: (date: Date | null) => void;
  recordLogin: () => void;
  getWeekStreak: () => StreakDay[];
  hasVisitedToday: () => boolean;
}

export const useStreakStore = create<Streak>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastStreakDate: null,
      loginDates: [],
      currentWeekDays: [],

      setStreak: (streak) => set({ streak }),

      setLastStreakDate: (date) => set({ lastStreakDate: date }),

      recordLogin: () => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
        const { loginDates, lastStreakDate } = get();

        const todayLogin = loginDates.find((day) => day.date === todayStr);

        let newLoginDates = [...loginDates];
        if (todayLogin) {
          newLoginDates = loginDates.map((day) =>
            day.date === todayStr ? { ...day, count: day.count + 1 } : day
          );
        } else {
          newLoginDates.push({ date: todayStr, count: 1 });
        }

        let newStreak = get().streak;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastStreakDate) {
          try {
            const lastLoginStr =
              lastStreakDate instanceof Date && !isNaN(lastStreakDate.getTime())
                ? lastStreakDate.toISOString().split("T")[0]
                : null;

            if (
              lastLoginStr &&
              (lastLoginStr === yesterdayStr || lastLoginStr === todayStr)
            ) {
              if (lastLoginStr !== todayStr) {
                newStreak += 1;
              }
            } else {
              newStreak = 1;
            }
          } catch (err) {
            // If any error occurs while processing the date, reset streak
            console.error("Error processing streak date:", err);
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const weekDays = getWeekDays();
        const currentWeekDays = weekDays.map((dayStr) => {
          const existingDay = newLoginDates.find((d) => d.date === dayStr);
          return existingDay || { date: dayStr, count: 0 };
        });

        set({
          loginDates: newLoginDates,
          streak: newStreak,
          lastStreakDate: today,
          currentWeekDays,
        });
      },

      getWeekStreak: () => {
        const weekDays = getWeekDays();
        const { loginDates } = get();

        return weekDays.map((dayStr) => {
          const existingDay = loginDates.find((d) => d.date === dayStr);
          return existingDay || { date: dayStr, count: 0 };
        });
      },

      hasVisitedToday: () => {
        const today = new Date().toISOString().split("T")[0];
        return get().loginDates.some((day) => day.date === today);
      },
    }),
    {
      name: "streak-store",
    }
  )
);

function getWeekDays(): string[] {
  const now = new Date();
  const current = new Date(now);
  const dayOfWeek = current.getDay();

  current.setDate(current.getDate() - dayOfWeek);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}
