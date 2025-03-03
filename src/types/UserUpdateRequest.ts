import { Roles } from "./Roles";
import { Semestre } from "./Semestre";

export interface UserUpdateRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: Roles[];
  filieres?: number[];
  semestre?: Semestre;
  isChef?: boolean;
  chefFiliere?: number[];
  password?: string;
}
