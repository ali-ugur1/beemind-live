import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tr } from '../i18n/tr';
import { en } from '../i18n/en';

const LanguageContext = createContext();
const LANG_KEY = 'beemind_language';

const translations = { tr, en };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'tr'; } catch { return 'tr'; }
  });

  const t = translations[lang] || translations.tr;

  // Sync HTML lang attribute with current language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = useCallback((newLang) => {
    setLang(newLang);
    try { localStorage.setItem(LANG_KEY, newLang); } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
