import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (onNavigate, enabled = true) => {
  const handleKeyDown = useCallback((e) => {
    // Input/textarea içindeyken kısayolları devre dışı bırak
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    // Modal açıkken devre dışı
    if (document.querySelector('[class*="fixed inset-0"]')) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'd': onNavigate('dashboard'); break;
      case 'l': onNavigate('list'); break;
      case 'h': onNavigate('map'); break;
      case 'r': onNavigate('reports'); break;
      case 'k': onNavigate('compare'); break;
      case 't': onNavigate('calendar'); break;
      case 'p': onNavigate('profile'); break;
      case 's':
        if (!e.ctrlKey && !e.metaKey) onNavigate('settings');
        break;
      case 'escape': onNavigate('back'); break;
      default: return;
    }
  }, [onNavigate]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

export default useKeyboardShortcuts;
