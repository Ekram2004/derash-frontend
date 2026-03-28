 feat/login-integration
import api from "../../../services/api";


export const loginApi = async (data: any) => {
  const response = await api.post("/auth/login", data);
  return response.data; // Returns the full { status, message, data, timestamp }
};

// src/features/auth/api/auth.api.ts
import { users } from "../../../mocks/data/users";

export interface User {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "BILLER";
}

interface FullUser {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "AGENT" | "BILLER";
}

export interface LoginResponse {
  user: User;
}

// Mock login API
export const loginApi = (email: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    // Find user by email and password
    const user = (users as FullUser[]).find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Exclude password before returning
      const { password, ...userWithoutPassword } = user;
      resolve({ user: userWithoutPassword });
    } else {
      reject(new Error("Invalid credentials"));
    }
  });
};

/*
// src/features/auth/api/auth.api.ts
export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch("https://api.derash.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials or network error");
  }

  const data = await response.json();
  // data should have { user: { name, email, role } } format
  return data;
};*/

