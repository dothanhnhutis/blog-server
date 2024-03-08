import { Role } from "./validations/user.validations";

export type UserAuth = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isActive: boolean;
  role: Role;
};
