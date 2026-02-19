"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth, initializeData, type User, type UserRole } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => User;
  register: (data: RegisterData) => User;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isLoggedIn: boolean;
  isRole: (role: UserRole) => boolean;
}

export interface RegisterData {
  role: UserRole;
  email: string;
  password: string;
  name: string;
  phone: string;
  city: string;
  // employer
  companyName?: string;
  inn?: string;
  companyType?: string;
  address?: string;
  district?: string;
  description?: string;
  services?: string[];
  workingHours?: string;
  // specialist
  specialization?: string;
  experience?: string;
  skills?: string[];
  // supplier
  category?: string;
  products?: string[];
  minOrder?: string;
  discount?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
    const stored = auth.getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = auth.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback((data: RegisterData) => {
    const u = auth.register({
      ...data,
      subscriptionPlan: data.role === "employer" ? "basic" : undefined,
      subscriptionExpiry: data.role === "employer" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      subAccounts: data.role === "employer" ? [] : undefined,
      status: data.role === "specialist" ? "searching" : undefined,
      availableForGigs: data.role === "specialist" ? true : undefined,
      portfolio: data.role === "specialist" ? [] : undefined,
      isCertified: false,
    });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = auth.updateProfile(user.id, updates);
    setUser(updated);
  }, [user]);

  const isRole = useCallback((role: UserRole) => user?.role === role, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateProfile,
      isLoggedIn: !!user, isRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
