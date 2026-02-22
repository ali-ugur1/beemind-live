// Varsayilan tek kovan - gercek kullanici kovani
// Kullanici yeni kovan ekledikce localStorage'a kaydedilir

export const DEFAULT_HIVE = {
  id: '01',
  name: 'Kovan 1 - Bahce',
  status: 'stable',
  alertType: null,
  temp: 34.5,
  humidity: 55,
  battery: 92,
  weight: 28.4,
  sound: 45,
  lastUpdate: 'Az once',
  lastActivity: 'Tum Sistemler Normal',
  priority: 3,
  lat: 37.8746,
  lng: 32.4932,
  location: 'Konya, Selcuklu',
  deviceSerial: 'AA:BB:CC:DD:EE:01',
};

// Utility fonksiyonlari
export const getStatusColor = (status) => {
  switch (status) {
    case 'critical':
      return { border: 'border-red-600', bg: 'bg-red-600/10', text: 'text-red-500', badge: 'bg-red-600' };
    case 'warning':
      return { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500' };
    case 'stable':
      return { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', badge: 'bg-emerald-500' };
    default:
      return { border: 'border-gray-600', bg: 'bg-gray-600/10', text: 'text-gray-500', badge: 'bg-gray-600' };
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'critical': return 'KRITIK';
    case 'warning': return 'UYARI';
    case 'stable': return 'STABIL';
    default: return 'BILINMIYOR';
  }
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'critical': return '🔴';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};
