"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav, TopBar } from "./nav";

export function PageWrapper({
  children,
  title,
  showBell = false,
}: {
  children: ReactNode;
  title?: string;
  showBell?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = pathname.split("/")[1];

  const handleBellClick = () => {
    router.push(`/${localePrefix}/community/inbox`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title={title} showBell={showBell} onBellClick={handleBellClick} />
      {/* pb accounts for the floating bottom nav (60px pill + 8px padding top + 8px padding bottom) */}
      <main className="pb-24 max-w-2xl mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
