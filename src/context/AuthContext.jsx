import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api/client';
import { getCurrentUser } from '../lib/api/users';
import { clearStoredAuth, getStoredAuth, storeAuth } from '../lib/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  initializing: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => null,
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => getStoredAuth());
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredAuth();
      setAuthState(stored);
      if (!stored?.token) {
        setInitializing(false);
        return;
      }
      try {
        const profile = await getCurrentUser();
        const nextState = { token: stored.token, user: profile };
        storeAuth(nextState);
        setAuthState(nextState);
      } catch (error) {
        clearStoredAuth();
        setAuthState(null);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback((payload) => {
    if (!payload) return;
    try {
      storeAuth(payload);
    } catch (error) {
      // ignore storage errors in non-browser environments
    }
    setAuthState(payload);
  }, []);

  const logout = useCallback(async () => {
    if (authState?.token) {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        // ignore logout errors
      }
    }
    clearStoredAuth();
    setAuthState(null);
  }, [authState?.token]);

  const refreshUser = useCallback(async () => {
    if (!authState?.token) {
      return null;
    }
    try {
      const profile = await getCurrentUser();
      setAuthState((prev) => {
        if (!prev) return prev;
        const nextState = { ...prev, user: profile };
        storeAuth(nextState);
        return nextState;
      });
      return profile;
    } catch (error) {
      return null;
    }
  }, [authState?.token]);

  const setUser = useCallback((nextUser) => {
    setAuthState((prev) => {
      if (!prev) return prev;
      const nextState = { ...prev, user: nextUser };
      storeAuth(nextState);
      return nextState;
    });
  }, []);

  const value = useMemo(() => ({
    user: authState?.user ?? null,
    token: authState?.token ?? null,
    initializing,
    login,
    logout,
    refreshUser,
    setUser,
  }), [authState, initializing, login, logout, refreshUser, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
