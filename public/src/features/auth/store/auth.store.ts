// src/features/auth/store/auth.store.ts
import { create } from "zustand";

// Define the type of the user
interface User {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "BILLER";
}

// Define the store state
interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user: User) => set({ user }),
  logout: () => set({ user: null }),
}));