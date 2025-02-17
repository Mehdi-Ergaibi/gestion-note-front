import { Roles } from "./Roles";
import { Semestre } from "./Semestre";

export type RegistrationRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Roles;
    // students
    cne?: string;
    filiereId?: number;
    semestre?: Semestre;
    // professors
    isChef?: boolean;
    filiereIds?: number[];
  };
  