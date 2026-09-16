import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { getToken, getStoredUser, setAuthData, clearAuthData } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app load
  useEffect(() => {
    async function initAuth() {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
        setToken(storedToken);
        setAuthData(storedToken, profile);
      } catch (err) {
        console.warn('Authentication token expired or invalid:', err.message);
        clearAuthData();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    setAuthData(authToken, authUser);
  };

  const handleLogout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    setAuthData(token, merged);
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setAuthData(token, profile);
      return profile;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
