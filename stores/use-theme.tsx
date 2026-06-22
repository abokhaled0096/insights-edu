import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggle: () => void;
  setDarkMode: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggle: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setDarkMode: (v) => set({ isDarkMode: v }),
    }),
    { name: 'theme-preference' } 
  )
);