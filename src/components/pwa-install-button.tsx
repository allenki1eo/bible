"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DownloadSimple } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/use-client-i18n";

export function PWAInstallButton() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstall(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleInstall}
      className="h-9 gap-1.5 px-2.5 text-xs font-medium"
    >
      <DownloadSimple size={16} />
      <span>{t("pwa.install_button")}</span>
    </Button>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
