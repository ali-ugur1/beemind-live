import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem("beemora_jwt");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  };
};

const getLang = () => localStorage.getItem("hexora_language") || "tr";

const t = (tr, en) => (getLang() === "tr" ? tr : en);

/**
 * BeeMora Push Notifications Hook
 *
 * 1) Service Worker push subscription (backend → push → SW → notification)
 * 2) Local browser notifications for critical hive alerts (fallback)
 *
 * Returns: { permission, isSubscribed, subscribe, unsubscribe }
 */
const usePushNotifications = (hives = []) => {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    if (!isPushSupported()) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {
      console.warn("[Push] checkSubscription failed:", err);
      setIsSubscribed(false);
    }
  }

  const subscribe = useCallback(async () => {
    if (!isPushSupported()) {
      console.warn("[Push] Push notifications not supported in this browser.");
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const keyRes = await fetch(`${API_BASE}/api/push/vapid-key`);
      if (!keyRes.ok)
        throw new Error(`VAPID key fetch failed: ${keyRes.status}`);

      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        console.warn("[Push] No VAPID key returned from server.");
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(subscription),
      });
      if (!res.ok) throw new Error(`Subscribe endpoint failed: ${res.status}`);

      setIsSubscribed(true);
      console.log("[Push] Subscribed successfully.");
      return true;
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!isPushSupported()) return false;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        const res = await fetch(`${API_BASE}/api/push/unsubscribe`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        if (!res.ok)
          console.warn(`[Push] Unsubscribe endpoint failed: ${res.status}`);
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
      console.log("[Push] Unsubscribed.");
      return true;
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
      return false;
    }
  }, []);

  // Local browser notification fallback for critical hives
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    if (!hives?.length) return;

    const criticalHives = hives.filter((h) => h.status === "critical");

    criticalHives.forEach((hive) => {
      if (notifiedRef.current.has(hive.id)) return;
      notifiedRef.current.add(hive.id);

      new Notification(
        t(
          `🔴 Kritik Alarm — Kovan #${hive.id}`,
          `🔴 Critical Alert — Hive #${hive.id}`,
        ),
        {
          body:
            hive.alertType ||
            t(
              "Kovan kritik durumda! Acil müdahale gerekiyor.",
              "Hive is in critical condition! Immediate action required.",
            ),
          icon: "/hexora-logo.svg",
          tag: `hexora-critical-${hive.id}`,
          requireInteraction: true,
        },
      );
    });

    // Resolve recovered hives from notified set
    const currentCriticalIds = new Set(criticalHives.map((h) => h.id));
    notifiedRef.current.forEach((id) => {
      if (!currentCriticalIds.has(id)) notifiedRef.current.delete(id);
    });
  }, [hives]);

  return { permission, isSubscribed, subscribe, unsubscribe };
};

// Helper: Convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
