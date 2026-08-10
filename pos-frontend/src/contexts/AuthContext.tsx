import React, { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import { UserDto } from '../api/types';
import { toast } from 'sonner';

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; role?: Role }>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const existingToken = localStorage.getItem('access_token');
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response && response.success && response.data) {
        setUser(response.data);
        setToken(existingToken);
      } else {
        authApi.logout();
        setUser(null);
        setToken(null);
      }
    } catch (err: any) {
      console.error('Failed to authenticate with backend:', err);
      // Clean invalid token if request returns error
      if (err?.status === 401 || err?.errorCode === 'UNAUTHORIZED') {
        authApi.logout();
        setUser(null);
        setToken(null);
      } else {
        toast.error(err?.message || 'Backend server is unreachable. Please ensure the backend is running at http://localhost:8080');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; role?: Role }> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response && response.success && response.data) {
        const data = response.data as any;
        const tokenVal = data.accessToken || data.token || '';
        const userVal = data.user;

        if (tokenVal && typeof window !== 'undefined') {
          localStorage.setItem('access_token', tokenVal);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
        }
        setToken(tokenVal);
        setUser(userVal);
        toast.success(`Welcome back, ${userVal?.name || 'User'}!`);
        setIsLoading(false);
        return { success: true, role: userVal?.role };
      } else {
        toast.error(response?.message || 'Login failed');
        setIsLoading(false);
        return { success: false };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err?.message || 'Failed to connect to backend server at http://localhost:8080';
      toast.error(errorMsg);
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    toast.info('Signed out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
