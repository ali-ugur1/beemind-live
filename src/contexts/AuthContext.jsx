import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AUTH_KEY = 'beemind_auth_token';
const FIRST_LOGIN_KEY = 'beemind_first_login';

// Hardcoded credentials
const VALID_USER = { username: 'admin', password: 'admin123', displayName: 'Admin', role: 'admin' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(AUTH_KEY);
      if (token) {
        const parsed = JSON.parse(token);
        if (parsed && parsed.username && parsed.expiry > Date.now()) {
          setUser({ username: parsed.username, displayName: parsed.displayName, role: parsed.role });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === VALID_USER.username && password === VALID_USER.password) {
      const userData = {
        username: VALID_USER.username,
        displayName: VALID_USER.displayName,
        role: VALID_USER.role,
        expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser({ username: userData.username, displayName: userData.displayName, role: userData.role });
      setIsAuthenticated(true);

      // Check if first login
      const hasLoggedBefore = localStorage.getItem(FIRST_LOGIN_KEY);
      if (!hasLoggedBefore) {
        setIsFirstLogin(true);
        localStorage.setItem(FIRST_LOGIN_KEY, '1');
      }

      return { success: true };
    }
    return { success: false, error: 'invalid_credentials' };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearFirstLogin = () => {
    setIsFirstLogin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isFirstLogin, loading, login, logout, clearFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
