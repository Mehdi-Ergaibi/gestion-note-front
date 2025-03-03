import { AuthContextType } from "./contexts/AuthContext";
import { Filiere } from "./types/Filiere";
import { RegistrationRequest } from "./types/RegistrationRequest";
import { Semestre } from "./types/Semestre";
import { UserUpdateRequest } from "./types/UserUpdateRequest";
const lhost = "http://localhost:8080";

let auth: AuthContextType;

export const setAuthInstance = (authInstance: AuthContextType) => {
  auth = authInstance;
};

export const api = {
  async request(url: string, options: RequestInit = {}) {
    /*  if (!auth) {
      throw new Error("Auth instance not initialized");
    } */

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
  async updateUser(userData: Partial<UserUpdateRequest>) {
    console.log("Updating user:", userData);

    const removeUndefineds = Object.fromEntries(
      Object.entries(userData).filter(([_, v]) => v !== undefined)
    );

    return this.request("/api/admin/update-user", {
      method: "POST",
      body: JSON.stringify(removeUndefineds),
    });
  },
  async deleteUser(email: string) {
    console.log(email);
    return this.request(`/api/admin/delete-user/${email}`, {
      method: "DELETE",
    });
  },
  async getConfiguration() {
    return this.request("/api/admin/configuration", {
      method: "GET",
    });
  },

  async updateNormalExam(enabled: boolean) {
    return this.request(
      `/api/admin/configuration/normal-exam?enabled=${enabled}`,
      {
        method: "PUT",
      }
    );
  },

  async updateRattExam(enabled: boolean) {
    return this.request(
      `/api/admin/configuration/ratt-exam?enabled=${enabled}`,
      {
        method: "PUT",
      }
    );
  },

  async updateStudentNotesVisibility(enabled: boolean) {
    return this.request(
      `/api/admin/configuration/student-notes?enabled=${enabled}`,
      {
        method: "PUT",
      }
    );
  },
  async getFilieres(): Promise<Filiere[]> {
    return this.request("/api/filieres");
  },

  async createFiliere(filiere: { name: string; semestre: Semestre }) {
    return this.request("/api/filieres", {
      method: "POST",
      body: JSON.stringify(filiere),
    });
  },

  async updateFiliere(
    id: number,
    filiere: { name: string; semestre: Semestre }
  ) {
    return this.request(`/api/filieres/${id}`, {
      method: "PUT",
      body: JSON.stringify(filiere),
    });
  },

  async deleteFiliere(id: number) {
    return this.request(`/api/filieres/${id}`, {
      method: "DELETE",
    });
  },
};
