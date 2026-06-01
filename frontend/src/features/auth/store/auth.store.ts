import { create } from "zustand";

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setMustChangePassword: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user) =>
    set({
      user: {
        ...user,
        mustChangePassword: user.mustChangePassword ?? false,
      },
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setMustChangePassword: (value) =>
    set((state) => ({
      user: state.user ? { ...state.user, mustChangePassword: value } : null,
    })),
}));
