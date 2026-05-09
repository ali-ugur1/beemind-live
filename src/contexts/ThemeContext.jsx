import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ─── Types / Constants ────────────────────────────────────────────────────────

/** @typedef {'dark' | 'light'} Theme */
/** @typedef {'amber' | 'emerald' | 'blue' | 'violet' | 'rose'} AccentKey */

/**
 * @typedef {Object} AccentColor
 * @property {string} name
 * @property {string} primary
 * @property {string} hover
 * @property {string} light
 * @property {AccentKey} css
 */

/** @type {Record<AccentKey, AccentColor>} */
export const ACCENT_COLORS = Object.freeze({
  amber: {
    name: "Amber",
    primary: "#f59e0b",
    hover: "#d97706",
    light: "#fbbf24",
    css: "amber",
  },
  emerald: {
    name: "Yeşil",
    primary: "#10b981",
    hover: "#059669",
    light: "#34d399",
    css: "emerald",
  },
  blue: {
    name: "Mavi",
    primary: "#3b82f6",
    hover: "#2563eb",
    light: "#60a5fa",
    css: "blue",
  },
  violet: {
    name: "Mor",
    primary: "#8b5cf6",
    hover: "#7c3aed",
    light: "#a78bfa",
    css: "violet",
  },
  rose: {
    name: "Pembe",
    primary: "#f43f5e",
    hover: "#e11d48",
    light: "#fb7185",
    css: "rose",
  },
});

/** @type {readonly AccentKey[]} */
const ACCENT_KEYS = /** @type {AccentKey[]} */ (Object.keys(ACCENT_COLORS));

const STORAGE_KEYS = /** @type {const} */ ({
  THEME: "beemora_theme",
  ACCENT: "beemora_accent",
});

// ─── Storage helpers (safe — never throws) ───────────────────────────────────

/** @param {string} key @returns {string | null} */
const storageGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** @param {string} key @param {string} value */
const storageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* silently ignore */
  }
};

// ─── Default / guard helpers ─────────────────────────────────────────────────

/** @param {unknown} value @returns {Theme} */
const resolveTheme = (value) =>
  value === "light" || value === "dark" ? /** @type {Theme} */ (value) : "dark";

/** @param {unknown} value @returns {AccentKey} */
const resolveAccent = (value) =>
  ACCENT_KEYS.includes(/** @type {AccentKey} */ (value))
    ? /** @type {AccentKey} */ (value)
    : "amber";

// ─── Context ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ThemeContextValue
 * @property {Theme}    theme
 * @property {() => void} toggleTheme
 * @property {AccentKey}  accent
 * @property {(newAccent: AccentKey) => void} changeAccent
 * @property {typeof ACCENT_COLORS} accentColors
 */

const ThemeContext = createContext(
  /** @type {ThemeContextValue | null} */ (null),
);

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** @returns {ThemeContextValue} */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * @param {{ children: React.ReactNode }} props
 */
export const ThemeProvider = ({ children }) => {
  // Initialise from storage once — lazy initialisers run only on mount
  const [theme, setTheme] = useState(() =>
    resolveTheme(storageGet(STORAGE_KEYS.THEME)),
  );

  const [accent, setAccent] = useState(() =>
    resolveAccent(storageGet(STORAGE_KEYS.ACCENT)),
  );

  // ── Apply theme to <html> and persist ──────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark-theme", isDark);
    root.classList.toggle("light-theme", !isDark);
    storageSet(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // ── Apply accent CSS variables / class to <html> and persist ───────────────
  useEffect(() => {
    const root = document.documentElement;
    const color = ACCENT_COLORS[accent];

    root.style.setProperty("--accent-primary", color.primary);
    root.style.setProperty("--accent-hover", color.hover);
    root.style.setProperty("--accent-light", color.light);

    // Swap accent class atomically (remove all, add current)
    root.classList.remove(...ACCENT_KEYS.map((k) => `accent-${k}`));
    root.classList.add(`accent-${accent}`);

    storageSet(STORAGE_KEYS.ACCENT, accent);
  }, [accent]);

  // ── Stable callbacks ───────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const changeAccent = useCallback((/** @type {AccentKey} */ newAccent) => {
    setAccent((prev) => (ACCENT_COLORS[newAccent] ? newAccent : prev));
  }, []);

  // ── Stable context value (prevents unnecessary re-renders) ─────────────────
  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      accent,
      changeAccent,
      accentColors: ACCENT_COLORS,
    }),
    [theme, toggleTheme, accent, changeAccent],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
