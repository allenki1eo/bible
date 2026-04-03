"use client";

import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/language-store";

const FLAGS: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7",
  sw: "\uD83C\uDDF8\uD83C\uDDEA",
};

export function LanguageToggle() {
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  const toggle = () => {
    const newLang = locale === "en" ? "sw" : "en";
    setLocale(newLang);
    window.location.href = `/${newLang}`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-9 gap-1.5 px-2.5 text-xs font-medium"
    >
      <span className="text-base leading-none">{FLAGS[locale]}</span>
      <span>{locale.toUpperCase()}</span>
    </Button>
  );
}
