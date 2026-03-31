import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Hexora Push Notifications Hook
 * 
 * 1) Service Worker push subscription (backend → push → SW → notification)
 * 2) Local browser notifications for critical hive alerts (fallback)
 * 
 * Returns: { permission, isSubscribed, subscribe, unsubscribe }
 */
const usePushNotifications = (hives = []) => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const notifiedRef = useRef(new Set());

  // Check existing subscription on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      setIsSubscribed(false);
    }
  }

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      // 1. Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      // 2. Get VAPID public key from backend
      const keyRes = await fetch(`${API_BASE}/api/push/vapid-key`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        console.warn('[Push] No VAPID key from server');
        return false;
      }

      // 3. Subscribe via Service Worker
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4. Send subscription to backend
      const token = localStorage.getItem('hexora_jwt');
      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      console.log('[Push] Subscribed successfully');
      return true;
    } catch (err) {
      console.error('[Push] Subscribe failed:', err);
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const token = localStorage.getItem('hexora_jwt');
        await fetch(`${API_BASE}/api/push/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      console.log('[Push] Unsubscribed');
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
      return false;
    }
  }, []);

  // Local browser notification fallback for critical hives
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!hives || hives.length === 0) return;

    const lang = localStorage.getItem('hexora_language') || 'tr';
    const isTr = lang === 'tr';
    const criticalHives = hives.filter(h => h.status === 'critical');

    criticalHives.forEach(hive => {
      if (notifiedRef.current.has(hive.id)) return;
      notifiedRef.current.add(hive.id);

      new Notification(isTr ? `🔴 Kritik Alarm — Kovan #${hive.id}` : `🔴 Critical Alert — Hive #${hive.id}`, {
        body: hive.alertType || (isTr ? 'Kovan kritik durumda! Acil müdahale gerekiyor.' : 'Hive is in critical condition! Immediate action required.'),
        icon: '/hexora-logo.svg',
        tag: `hexora-critical-${hive.id}`,
        requireInteraction: true,
      });
    });

    const currentCriticalIds = new Set(criticalHives.map(h => h.id));
    notifiedRef.current.forEach(id => {
      if (!currentCriticalIds.has(id)) {
        notifiedRef.current.delete(id);
      }
    });
  }, [hives]);

  return { permission, isSubscribed, subscribe, unsubscribe };
};

// Helper: Convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
