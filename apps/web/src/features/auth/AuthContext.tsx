/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../services/api';
import { clearTokens, getRefreshToken, storeTokens } from '../../services/tokenStorage';
import type { AuthResponse, ForgotPasswordResponse, User } from '../../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await apiRequest<User>('/auth/me');
      setUser(profile);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify({ email, password }),
    });
    storeTokens(response.tokens);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify({ fullName, email, password }),
    });
    storeTokens(response.tokens);
    setUser(response.user);
    return response.emailVerificationToken ?? null;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }
    clearTokens();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify({ email }),
    });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify({ token, password }),
    });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await apiRequest('/auth/verify-email', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify({ token }),
    });
    await loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (fullName: string) => {
    const updatedUser = await apiRequest<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName }),
    });
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      updateProfile,
    }),
    [forgotPassword, loading, login, logout, resetPassword, signup, updateProfile, user, verifyEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
