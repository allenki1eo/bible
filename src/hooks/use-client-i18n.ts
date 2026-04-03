"use client";

import { useCallback, useEffect } from "react";
import enMessages from "@/messages/en.json";
import swMessages from "@/messages/sw.json";
import { useLanguageStore } from "@/stores/language-store";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string;
}

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);
  const loadLocale = useLanguageStore((s) => s.loadLocale);

  useEffect(() => {
    loadLocale();
  }, [loadLocale]);

  const messages: Record<string, unknown> =
    locale === "sw" ? swMessages : enMessages;

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value =
        getNestedValue(messages as unknown as Record<string, unknown>, key) ||
        key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, v);
        });
      }
      return value;
    },
    [messages]
  );

  return { t, locale };
}
