// api.ts
import { AuthContextType } from "./contexts/AuthContext";
const lhost = "http://localhost:8080";

let auth: AuthContextType | null = null;

export const setAuthInstance = (authInstance: AuthContextType) => {
  auth = authInstance;
};

export const api = {
  async request(url: string, options: RequestInit = {}) {
    if (!auth) {
      throw new Error("Auth instance not initialized");
    }

    /* if (!auth.token || auth.isTokenExpired) {
      auth.logout();
      throw new Error("Session expirée");
    } */

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
      ...options.headers,
    };

    const response = await fetch(`${lhost}${url}`, { ...options, headers });

    if (response.status === 401) {
      auth.logout();
      throw new Error("Non autorisé");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Échec de la requête");
    }

    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${lhost}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Échec de la connexion");
    }

    const { token } = await response.json();
    return { token };
  },

  async getUsers() {
    return this.request("/api/admin/users");
  },
};
