"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Bell, BellSlash } from "@phosphor-icons/react";
import { useToast } from "@/components/toast";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationToggle() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {}
  }, []);

  useEffect(() => { checkSubscription(); }, [checkSubscription]);

  const subscribe = async () => {
    if (!user || user.isGuest) {
      toast("Sign in to enable notifications", "error");
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      toast("Push notifications not configured (missing VAPID key)", "error");
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Permission denied — enable notifications in your browser settings", "error");
        setLoading(false);
        return;
      }

      // Make sure SW is registered and active
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const prefs = (() => {
        try { return JSON.parse(localStorage.getItem("nuru_notif_prefs") || "{}"); } catch { return {}; }
      })();

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id,
          notifPrefs: prefs,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error || `HTTP ${res.status}`);
      }

      setSubscribed(true);
      toast("Notifications enabled! You'll get your morning devotion at 7 AM EAT.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enable notifications";
      console.error("[NotificationToggle] subscribe error:", err);
      toast(msg, "error");
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setSubscribed(false);
        toast("Notifications disabled", "info");
      }
    } catch {
      toast("Failed to disable notifications", "error");
    }
    setLoading(false);
  };

  // Don't render if no user, not supported, or VAPID not configured
  if (!user || !supported) return null;

  return (
    <Button
      variant={subscribed ? "default" : "outline"}
      size="sm"
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className="gap-1.5 h-8 text-xs"
    >
      {loading ? (
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : subscribed ? (
        <Bell size={13} weight="fill" />
      ) : (
        <BellSlash size={13} />
      )}
      {subscribed ? "On" : "Off"}
    </Button>
  );
}
