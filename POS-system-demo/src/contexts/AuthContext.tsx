/**
 * DEMO MODE — AuthContext
 * All API calls removed. Authentication is simulated locally.
 * Demo credentials:
 *   admin@demo.com    / demo123  → ADMIN
 *   manager@demo.com  / demo123  → MANAGER
 *   cashier@demo.com  / demo123  → CASHIER
 *   super@demo.com    / demo123  → SUPER_ADMIN
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER' | 'SUPER_ADMIN';

interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId?: string;
  businessName?: string;
  subdomain?: string;
  branchName?: string;
  branchSlug?: string;
}

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; role?: Role }>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  setRole: (role: Role) => void;
}

const DEMO_USERS: Record<string, UserDto & { password: string }> = {
  'admin@demo.com': {
    id: 'u-1', name: 'Ruwan Silva', email: 'admin@demo.com',
    role: 'ADMIN', businessId: 'tenant-001',
    businessName: 'Sathosa Group (Pvt) Ltd', subdomain: 'sathosa',
    password: 'demo123'
  },
  'manager@demo.com': {
    id: 'u-2', name: 'Anushka Weerasinghe', email: 'manager@demo.com',
    role: 'MANAGER', businessId: 'tenant-001',
    businessName: 'Sathosa Group (Pvt) Ltd', subdomain: 'sathosa',
    password: 'demo123'
  },
  'cashier@demo.com': {
    id: 'u-4', name: 'Nadeesha Perera', email: 'cashier@demo.com',
    role: 'CASHIER', businessId: 'tenant-001',
    businessName: 'Sathosa Group (Pvt) Ltd', subdomain: 'sathosa',
    password: 'demo123'
  },
  'super@demo.com': {
    id: 'u-super', name: 'Super Admin', email: 'super@demo.com',
    role: 'SUPER_ADMIN', password: 'demo123'
  }
};

const SESSION_KEY = 'nexpos_demo_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserDto;
        setUser(parsed);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; role?: Role }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Simulate network delay

    const normalized = email.trim().toLowerCase();
    const record = DEMO_USERS[normalized];

    if (record && (password === record.password || password === 'demo123')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...userDto } = record;
      setUser(userDto);
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userDto));
      } catch {
        // ignore
      }
      toast.success(`Welcome back, ${userDto.name}!`);
      setIsLoading(false);
      return { success: true, role: userDto.role };
    }

    // Also allow any email with demo123 as a generic cashier for exploration
    if (password === 'demo123' && normalized.length > 0) {
      const genericUser: UserDto = {
        id: `u-generic-${Date.now()}`,
        name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalized,
        role: 'CASHIER',
        businessId: 'tenant-001',
        businessName: 'Sathosa Group (Pvt) Ltd',
        subdomain: 'sathosa'
      };
      setUser(genericUser);
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(genericUser));
      } catch {
        // ignore
      }
      toast.success(`Welcome, ${genericUser.name}!`);
      setIsLoading(false);
      return { success: true, role: genericUser.role };
    }

    toast.error('Invalid credentials. Use demo123 as your password.');
    setIsLoading(false);
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    toast.info('Signed out of demo session');
  };

  const refetchUser = async () => {
    // No-op in demo mode
  };

  const setRole = (role: Role) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user ? 'demo-token' : null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refetchUser,
        setRole,
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
