// src/features/auth/store/auth.store.ts

import { create } from "zustand";
import Cookies from "js-cookie";

// Define the type of the user
export interface User {
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "BILLER";
  phone?: string;
  company?: string;
  address?: string;
  avatar?: string;
  mustChangePassword?: boolean;
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