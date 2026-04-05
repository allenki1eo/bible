"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  UsersThree,
  BookOpen,
  BookBookmark,
  User,
  Bell,
  Heart,
  Gear,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-client-i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { PWAInstallButton } from "@/components/pwa-install-button";

const navItems = [
  { href: "/", icon: House, labelKey: "nav.home" },
  { href: "/community", icon: UsersThree, labelKey: "nav.community" },
  { href: "/devotions", icon: BookOpen, labelKey: "nav.devotions" },
  { href: "/stories", icon: BookBookmark, labelKey: "nav.stories" },
  { href: "/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const localePrefix = pathname.split("/")[1];
  const currentPath = pathname.replace(`/${localePrefix}`, "") || "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Floating pill container */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-around bg-background/95 border border-border/50 backdrop-blur-md rounded-2xl h-[60px] max-w-lg mx-auto px-1 shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" && currentPath.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${localePrefix}${item.href}`}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 group"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/12"
                      : "group-hover:bg-muted"
                  )}
                >
                  <Icon
                    size={21}
                    weight={isActive ? "fill" : "regular"}
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[9.5px] font-medium leading-none transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function TopBar({
  title,
  showBell = false,
  onBellClick,
}: {
  title?: string;
  showBell?: boolean;
  onBellClick?: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const localePrefix = pathname.split("/")[1];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between h-14 max-w-2xl mx-auto px-4">
        {/* Logo + title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
            <img src="/logos/light.png" alt="Nuru" className="w-full h-full object-cover dark:hidden" />
            <img src="/logos/dark.png" alt="Nuru" className="w-full h-full object-cover hidden dark:block" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            {title || t("app.name")}
          </span>
        </div>

        {/* Right controls — max 4 icons total */}
        <div className="flex items-center gap-0.5">
          <PWAInstallButton />
          <LanguageToggle />
          <ThemeToggle />
          {showBell ? (
            <button
              onClick={onBellClick}
              className="relative p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={19} weight="bold" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
            </button>
          ) : (
            <Link
              href={`/${localePrefix}/donate`}
              className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-rose-500"
              aria-label="Donate"
            >
              <Heart size={19} weight="bold" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
