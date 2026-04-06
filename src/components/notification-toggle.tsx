"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Bell, BellSlash, Warning } from "@phosphor-icons/react";
import { useToast } from "@/components/toast";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) view[i] = rawData.charCodeAt(i);
  return buffer;
}

/** Fetch VAPID public key from the server (works with or without NEXT_PUBLIC_ prefix) */
async function fetchVapidKey(): Promise<string> {
  const res = await fetch("/api/notifications/vapid-key");
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error ?? "Could not load VAPID key");
  }
  const { publicKey } = await res.json();
  return publicKey as string;
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
    setLoading(true);
    try {
      // 1. Fetch VAPID public key from server
      let vapidPublicKey: string;
      try {
        vapidPublicKey = await fetchVapidKey();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "VAPID key not configured";
        toast(`Notifications not set up: ${msg}`, "error");
        setLoading(false);
        return;
      }

      // 2. Request browser permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Permission denied — enable notifications in your browser settings", "error");
        setLoading(false);
        return;
      }

      // 3. Register service worker and subscribe
      const reg = await navigator.serviceWorker.ready;

      // Unsubscribe any stale subscription first (avoids key-mismatch errors)
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe().catch(() => null);

      let subscription: PushSubscription;
      try {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[NotificationToggle] subscribe error:", msg, "key length:", vapidPublicKey.length);
        const hint = msg.includes("applicationServerKey")
          ? "The VAPID public key is invalid — please regenerate it from the admin panel and update your Vercel environment variables."
          : msg;
        toast(hint, "error");
        setLoading(false);
        return;
      }

      // 4. Send subscription to Supabase via our API
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
        const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(error ?? "Failed to save subscription");
      }

      setSubscribed(true);
      toast("Notifications enabled! You'll get your morning devotion at 7 AM EAT.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enable notifications";
      console.error("[NotificationToggle] error:", err);
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
