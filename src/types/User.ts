export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role:
      | "admin"
      | "prof" | "coordinateur" 
      | "etudiant"
      | "administrateur absence"
      | "secretaire general"
      | "chef service scolarite";
    filieres?: string[];
    semestre?: string;
    isChef?: boolean;
    chefFiliere?: string;
  }