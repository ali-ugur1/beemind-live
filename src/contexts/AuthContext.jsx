import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "beemora_jwt";
const USER_KEY = "hexora_user";
const FIRST_LOGIN_KEY = "hexora_first_login";
const API_BASE = import.meta.env.VITE_API_URL || "";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      return;
    }

    // Verify token in background
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401 || r.status === 403) {
          // Token actually rejected by server — clear session
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        if (!r.ok) return; // network/server hiccup — keep local session
        const data = await r.json();
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        // Network error — keep local session for offline use
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for auth-expired events from api.js
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener("beemora:auth-expired", handleAuthExpired);
    return () =>
      window.removeEventListener("beemora:auth-expired", handleAuthExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.error || "invalid_credentials" };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);

      const hasLoggedBefore = localStorage.getItem(FIRST_LOGIN_KEY);
      if (!hasLoggedBefore) {
        setIsFirstLogin(true);
        localStorage.setItem(FIRST_LOGIN_KEY, "1");
      }

      return { success: true };
    } catch {
      return { success: false, error: "network_error" };
    }
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.error || "registration_failed" };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      setIsFirstLogin(true);
      localStorage.setItem(FIRST_LOGIN_KEY, "1");

      return { success: true };
    } catch {
      return { success: false, error: "network_error" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setIsFirstLogin(false);
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const clearFirstLogin = useCallback(() => {
    setIsFirstLogin(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isFirstLogin,
      loading,
      login,
      register,
      logout,
      getToken,
      clearFirstLogin,
    }),
    [
      user,
      isAuthenticated,
      isFirstLogin,
      loading,
      login,
      register,
      logout,
      getToken,
      clearFirstLogin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
