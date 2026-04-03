"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Bell, BellSlash } from "@phosphor-icons/react";
import { useToast } from "@/components/toast";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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

  const checkSubscription = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      setSubscribed(!!subscription);
    } catch {}
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!user || !VAPID_PUBLIC_KEY) return;
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Notification permission denied", "error");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id,
        }),
      });

      setSubscribed(true);
      toast("Notifications enabled!", "success");
    } catch (err) {
      console.error("Subscribe error:", err);
      toast("Failed to enable notifications", "error");
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setSubscribed(false);
        toast("Notifications disabled", "info");
      }
    } catch {
      toast("Failed to disable notifications", "error");
    }
    setLoading(false);
  };

  if (!user || !VAPID_PUBLIC_KEY) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className="gap-1.5 h-8 text-xs"
    >
      {subscribed ? (
        <>
          <Bell size={14} weight="fill" />
          On
        </>
      ) : (
        <>
          <BellSlash size={14} />
          Off
        </>
      )}
    </Button>
  );
}
