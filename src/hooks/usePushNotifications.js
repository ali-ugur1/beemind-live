import { useEffect, useRef } from 'react';

/**
 * Kritik kovan durumlarında otomatik browser push notification gönderir.
 * Sadece Notification.permission === 'granted' olduğunda çalışır.
 * Aynı kovan için tekrar bildirim gönderilmesini önler (session boyunca).
 */
const usePushNotifications = (hives) => {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const criticalHives = hives.filter(h => h.status === 'critical');

    criticalHives.forEach(hive => {
      if (notifiedRef.current.has(hive.id)) return;
      notifiedRef.current.add(hive.id);

      new Notification(`🔴 Kritik Alarm — Kovan #${hive.id}`, {
        body: hive.alertType || 'Kovan kritik durumda! Acil müdahale gerekiyor.',
        icon: '/logo.png',
        tag: `beemind-critical-${hive.id}`,
        requireInteraction: true,
      });
    });

    // Kritik durumdan çıkan kovanları set'ten temizle
    const currentCriticalIds = new Set(criticalHives.map(h => h.id));
    notifiedRef.current.forEach(id => {
      if (!currentCriticalIds.has(id)) {
        notifiedRef.current.delete(id);
      }
    });
  }, [hives]);
};

export default usePushNotifications;
