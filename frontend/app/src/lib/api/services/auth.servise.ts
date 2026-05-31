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
  return apiFetch<ApiResponse<User>>("/auth/register", {
    method: "POST",
    body: input,
    // credentials: "omit",
  });
}

// export async function login(input: RegisterInput) {
//   return apiFetch<ApiResponse<User>>("/auth/login", {
//     method: "POST",
//     body: input,
//   });
// }

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
