// src/features/auth/store/auth.store.ts

import { create } from "zustand";
import Cookies from "js-cookie";

// 💡 1. Define types for the nested objects matching your dynamic banks/agents
export interface UserAgentRelation {
  id: string;
  code: string;
  apiKey: string;
  name: string;
}

export interface UserBillerRelation {
  id: string;
  name: string;
}

// Define the type of the user
export interface User {
  id?: string;
  name: string;
  email: string;
  // 💡 Updated role to allow both styles ('AGENT' or 'AGENT_USER') used in your backend/frontend
  role: "ADMIN" | "AGENT" | "BILLER" | "SYSTEM_ADMIN" | "BILLER_USER" | "AGENT_USER";
  phone?: string;
  company?: string;
  address?: string;
  avatar?: string;
  mustChangePassword?: boolean;
  
  // 💡 2. Add these relational fields here so TypeScript stops complaining!
  agent?: UserAgentRelation | null;
  biller?: UserBillerRelation | null;
}

// Define the store state
interface AuthState {
  user: User | null;
  token: string | null;
  
  // Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setMustChangePassword: (value: boolean) => void;
}

// Cookie key
const TOKEN_KEY = "derash_token";

// Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get(TOKEN_KEY) || null,

  login: (user: User, token?: string) => {
    const authToken = token || "derash_secure_token";
    
    Cookies.set(TOKEN_KEY, authToken, { expires: 1 / 24 }); // 1 hour
    
    set({
      user: {
        ...user,
        mustChangePassword: user.mustChangePassword ?? false,
      },
      token: authToken,
    });
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);
    set({
      user: null,
      token: null,
    });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  setMustChangePassword: (value: boolean) => {
    set((state) => ({
      user: state.user
        ? { ...state.user, mustChangePassword: value }
        : null,
    }));
  },
}));