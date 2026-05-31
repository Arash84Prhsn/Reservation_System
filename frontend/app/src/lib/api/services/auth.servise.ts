import { toast } from "sonner";
import { HttpError } from "../core/errors";
import { apiFetch } from "../core/http";

export enum AssociationStatus {
  None = "None",
  DotinEmployee = "Dotin employee",
  DotinAssociate = "Dotin associate",
  DataScienceCompetitions = "Data science competitions",
  RelatedCompany = "Related Company",
  BachelorStudent = "Bachelor student",
  MasterStudent = "Master's student",
  PhDStudent = "PhD student",
}

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  phone: string;
  association: AssociationStatus;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  username: string;
  phone?: string;
  association?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function register(input: RegisterInput) {
  const res = await apiFetch<ApiResponse<User>>("/auth/register", {
    method: "POST",
    body: input,
    // credentials: "omit",
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "Registration failed", 400, res);
  }

  return res;
}

export async function login(input: LoginInput) {
  const res = await apiFetch<ApiResponse<User>>("/auth/login", {
    method: "POST",
    body: input,
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "ورود ناموفق بود");
    throw new HttpError(res.message || "Login failed", 400, res);
  }

  return res;
}

// export async function sessionInfo() {
//   return apiFetch<ApiResponse<User | null>>("/user/session_info", {
//     method: "GET",
//   });
// }

// export async function logout() {
//   return apiFetch<ApiResponse<null>>("/user/logout", {
//     method: "POST",
//   });
// }
