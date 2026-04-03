"use client";

import { create } from "zustand";

type Locale = "en" | "sw";

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  loadLocale: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: "en",

  setLocale: (locale: Locale) => {
    set({ locale });
    if (typeof window !== "undefined") {
      localStorage.setItem("faithflow_locale", locale);
      document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  },

  loadLocale: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("faithflow_locale");
      if (stored === "en" || stored === "sw") {
        set({ locale: stored });
        document.cookie = `locale=${stored};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      }
    }
  },
}));
