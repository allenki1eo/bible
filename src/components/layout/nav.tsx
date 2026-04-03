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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`/${localePrefix}${item.href}`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors min-w-[56px]",
                isActive
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className="transition-all"
              />
              <span className="text-[10px] font-medium leading-none">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
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
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logos/light.png" alt="Nuru" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            {title || t("app.name")}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <PWAInstallButton />
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href={`/${localePrefix}/donate`}
            className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-red-500"
          >
            <Heart size={20} weight="bold" />
          </Link>
          {showBell && (
            <button
              onClick={onBellClick}
              className="relative p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell size={20} weight="bold" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
