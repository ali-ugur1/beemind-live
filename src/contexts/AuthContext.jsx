import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'hexora_jwt';
const USER_KEY = 'hexora_user';
const FIRST_LOGIN_KEY = 'hexora_first_login';
const API_BASE = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
        // Verify token in background
        fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          })
          .catch(() => {
            // Token expired or invalid — keep local session for offline
          });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Listen for auth-expired events from api.js
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('hexora:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('hexora:auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'invalid_credentials' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);

      const hasLoggedBefore = localStorage.getItem(FIRST_LOGIN_KEY);
      if (!hasLoggedBefore) {
        setIsFirstLogin(true);
        localStorage.setItem(FIRST_LOGIN_KEY, '1');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'network_error' };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      setIsFirstLogin(true);
      localStorage.setItem(FIRST_LOGIN_KEY, '1');

      return { success: true };
    } catch {
      return { success: false, error: 'network_error' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const clearFirstLogin = () => {
    setIsFirstLogin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isFirstLogin, loading, login, register, logout, getToken, clearFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
