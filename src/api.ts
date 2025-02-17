import { AuthContextType } from "./contexts/AuthContext";
import { RegistrationRequest } from "./types/RegistrationRequest";
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

    const token = localStorage.getItem("jwtToken");

    /* if (!auth.token || auth.isTokenExpired) {
      auth.logout();
      throw new Error("Session expirée");
    } */

    console.log("token: ", token);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

  async registerUser(userData: RegistrationRequest) {
    console.log(userData);
    return this.request("/api/admin/add-user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getUsers() {
    return this.request("/api/admin/users");
  },
  async getAdmins() {
    return this.request("/api/admin/admins");
  },
  async getChefsFilieres() {
    return this.request("/api/admin/coordinateurs");
  },
  async getProfs() {
    return this.request("/api/admin/profs");
  },
  async getStudents() {
    return this.request("/api/admin/students");
  },
  async getAdminAbsence() {
    return this.request("/api/admin/admins-absence");
  },
  async getSecretaires() {
    return this.request("/api/admin/secretaires");
  },
  async getChefScolarite() {
    return this.request("/api/admin/chefs-scolarite");
  },
};
