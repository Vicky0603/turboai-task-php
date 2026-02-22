"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User, LoginCredentials, RegisterData, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Attempt to restore an authenticated session from stored tokens.
   * Fetches the current user if an access token exists.
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const response = await api.get("/auth/me/");
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in using credentials, store JWT tokens, and set user state.
   */
  const login = async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login/", credentials);
    const { user, access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(user);
    router.push("/dashboard");
  };

  /**
   * Register a new user, store JWT tokens, and set user state.
   */
  const register = async (data: RegisterData) => {
    const response = await api.post<AuthResponse>("/auth/register/", data);
    const { user, access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(user);
    router.push("/dashboard");
  };

  /**
   * Clear tokens and user state, then redirect to the login page.
   */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
