// BeeMind Live - Utility Fonksiyonları
// Durum renkleri, metin ve bildirim ikonları

export const getStatusColor = (status) => {
  switch (status) {
    case 'critical':
      return {
        border: 'border-red-600',
        bg: 'bg-red-600/10',
        text: 'text-red-500',
        badge: 'bg-red-600'
      };
    case 'warning':
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-500/10',
        text: 'text-amber-500',
        badge: 'bg-amber-500'
      };
    case 'stable':
      return {
        border: 'border-emerald-500',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        badge: 'bg-emerald-500'
      };
    default:
      return {
        border: 'border-gray-600',
        bg: 'bg-gray-600/10',
        text: 'text-gray-500',
        badge: 'bg-gray-600'
      };
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'critical':
      return 'KRİTİK';
    case 'warning':
      return 'UYARI';
    case 'stable':
      return 'STABİL';
    default:
      return 'BİLİNMİYOR';
  }
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
};

// Canlı kovan verilerinden bildirim oluştur
export function generateNotifications(hives) {
  const notifs = [];
  let id = 1;

  hives.forEach(hive => {
    if (hive.status === 'critical') {
      notifs.push({
        id: id++,
        type: 'critical',
        hiveId: hive.id,
        message: hive.alertType || 'Kritik durum algılandı',
        time: hive.lastUpdate,
        read: false
      });
    } else if (hive.status === 'warning') {
      notifs.push({
        id: id++,
        type: 'warning',
        hiveId: hive.id,
        message: hive.alertType || 'Uyarı durumu',
        time: hive.lastUpdate,
        read: false
      });
    }
  });

  // Düşük pil bildirimi
  hives.filter(h => h.battery < 20).forEach(hive => {
    if (!notifs.find(n => n.hiveId === hive.id && n.message.includes('Pil'))) {
      notifs.push({
        id: id++,
        type: 'warning',
        hiveId: hive.id,
        message: `Düşük Pil Seviyesi (%${hive.battery})`,
        time: hive.lastUpdate,
        read: true
      });
    }
  });

  return notifs;
}
