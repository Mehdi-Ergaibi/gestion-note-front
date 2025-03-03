import { Roles } from "./Roles";
import { Semestre } from "./Semestre";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  roles?: Roles[];
  filieres?: string[];
  semestre?: Semestre;
  isChef?: boolean;
  chefFiliere?: string[];
}
