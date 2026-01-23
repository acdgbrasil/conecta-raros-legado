import { User } from "@/shared/models/user.model";

export interface AuthModel {
      email: string;
      password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
