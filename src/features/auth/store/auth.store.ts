// src/features/auth/store/auth.store.ts

import { create } from "zustand";
import Cookies from "js-cookie";

// Define the type of the user
interface User {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "BILLER";

  // ✅ NEW FIELD (safe add)
  mustChangePassword?: boolean;
}

// Define the store state
interface AuthState {
  user: User | null;
  token: string | null;

  login: (user: User) => void;
  logout: () => void;

  // ✅ NEW ACTION
  setMustChangePassword: (value: boolean) => void;
}

// Cookie key
const TOKEN_KEY = "derash_token";

// Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get(TOKEN_KEY) || null,

  login: (user: User) => {
    // Create fake token (since you use mock backend)
    const fakeToken = "derash_secure_token";

    Cookies.set(TOKEN_KEY, fakeToken, { expires: 1 / 24 }); // 1 hour

    set({
      user: {
        ...user,

        // ✅ FORCE password change on login (you can remove later)
        mustChangePassword: true,
      },
      token: fakeToken,
    });
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);

    set({
      user: null,
      token: null,
    });
  },

  // ✅ UPDATE PASSWORD STATUS
  setMustChangePassword: (value: boolean) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, mustChangePassword: value }
        : null,
    })),
}));