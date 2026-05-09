import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { tr } from "../i18n/tr";
import { en } from "../i18n/en";

const LanguageContext = createContext(null);
const LANG_KEY = "beemora_language";
const DEFAULT_LANG = "tr";
const SUPPORTED_LANGS = ["tr", "en"];

const translations = { tr, en };

const getInitialLang = () => {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    // Tarayıcı dilinden otomatik tespit (opsiyonel fallback)
    if (typeof navigator !== "undefined" && navigator.language) {
      const browserLang = navigator.language.toLowerCase().split("-")[0];
      if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;
    }
  } catch {
    // localStorage erişilemezse sessizce devam et
  }
  return DEFAULT_LANG;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);

  const t = useMemo(
    () => translations[lang] || translations[DEFAULT_LANG],
    [lang],
  );

  // HTML lang attribute'unu mevcut dille senkronize et
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) {
      console.warn(
        `[LanguageProvider] Desteklenmeyen dil: "${newLang}". Mevcut diller: ${SUPPORTED_LANGS.join(", ")}`,
      );
      return;
    }

    setLang((prev) => {
      if (prev === newLang) return prev;
      try {
        localStorage.setItem(LANG_KEY, newLang);
      } catch {
        // localStorage erişilemezse sessizce devam et
      }
      return newLang;
    });
  }, []);

  const value = useMemo(
    () => ({ lang, t, changeLanguage, supportedLangs: SUPPORTED_LANGS }),
    [lang, t, changeLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
