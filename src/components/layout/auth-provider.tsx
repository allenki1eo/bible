"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguageStore } from "@/stores/language-store";
import { useThemeStore } from "@/stores/theme-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((s) => s.loadUser);
  const loadLocale = useLanguageStore((s) => s.loadLocale);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadLocale();
    loadTheme();
    loadUser();
  }, [loadLocale, loadTheme, loadUser]);

  return <>{children}</>;
}
