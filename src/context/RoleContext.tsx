'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'hod' | 'faculty' | 'student' | null;

interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  dept?: string;
  branch?: string;
  rollNumber?: string;
  batch?: string;
  mentor?: string;
  attendance?: number;
}

interface RoleContextType {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signup: (data: { 
    email: string; password: string; name: string; role: string; 
    dept?: string; branch?: string; rollNumber?: string; batch?: string; mentor?: string 
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (data: any) => Promise<{ success: boolean; message?: string; error?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('v4_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setRole(parsed.role);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user);
        setRole(data.user.role);
        sessionStorage.setItem('v4_user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Connection Failed' };
    }
  };

  const signup = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Connection Failed' };
    }
  };

  const updateProfile = async (formData: any) => {
    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, ...data.user }));
        sessionStorage.setItem('v4_user', JSON.stringify({ ...user, ...data.user }));
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Connection Failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    sessionStorage.removeItem('v4_user');
    // Also clear the nexus_token cookie via a logout route or client-side logic
    document.cookie = "nexus_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  return (
    <RoleContext.Provider value={{ user, role, login, signup, updateProfile, logout, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
