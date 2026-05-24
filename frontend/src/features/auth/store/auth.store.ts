import { create } from "zustand";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: "SYSTEM_ADMIN" | "AGENT_USER" | "BILLER_USER";
  phone?: string;
  company?: string;
  address?: string;
  avatar?: string;
  mustChangePassword?: boolean;
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
