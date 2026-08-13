import { toast } from "sonner";
import { HttpError } from "../core/errors";
import { apiFetch } from "../core/http";

export interface LogoutResponse {
  message: string;
  success: string;
}

// type: register, login, user_profile
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

export const ASSOCIATION_STATUS_LABELS: Record<AssociationStatus, string> = {
  [AssociationStatus.None]: "نامشخص",
  [AssociationStatus.DotinEmployee]: "کارمند داتین",
  [AssociationStatus.DotinAssociate]: "همکار داتین",
  [AssociationStatus.DataScienceCompetitions]: "مسابقات علوم داده",
  [AssociationStatus.RelatedCompany]: "شرکت مرتبط",
  [AssociationStatus.BachelorStudent]: "دانشجوی کارشناسی",
  [AssociationStatus.MasterStudent]: "دانشجوی ارشد",
  [AssociationStatus.PhDStudent]: "دانشجوی دکتری",
};

/**
 * Safely parses any incoming string into a type-safe `AssociationStatus` enum value.
 */
export function parseAssociationStatus(status?: string | null): AssociationStatus {
  if (!status) return AssociationStatus.None;
  const clean = status.trim().toLowerCase().replace(/['_\s]/g, "");

  for (const value of Object.values(AssociationStatus)) {
    if (clean === value.toLowerCase().replace(/['_\s]/g, "")) {
      return value;
    }
  }

  if (clean.includes("bachelor")) return AssociationStatus.BachelorStudent;
  if (clean.includes("master")) return AssociationStatus.MasterStudent;
  if (clean.includes("phd")) return AssociationStatus.PhDStudent;
  if (clean.includes("employee")) return AssociationStatus.DotinEmployee;
  if (clean.includes("associate")) return AssociationStatus.DotinAssociate;
  if (clean.includes("datascience") || clean.includes("datainside") || clean.includes("competition")) {
    return AssociationStatus.DataScienceCompetitions;
  }
  if (clean.includes("company") || clean.includes("related")) return AssociationStatus.RelatedCompany;

  return AssociationStatus.None;
}

/**
 * Returns the Persian display label for an `AssociationStatus` or status string.
 */
export function getAssociationStatusLabel(status?: AssociationStatus | string | null): string {
  const enumStatus = parseAssociationStatus(status);
  return ASSOCIATION_STATUS_LABELS[enumStatus];
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

// type: update email
export interface UpdateEmailResponse {
  success: boolean;
  message: string;
  newEmail: string;
}

// type: update phone
export interface UpdatePhoneResponse {
  success: boolean;
  message: string;
  newPhone: string;
}
// type: update user name
export interface UpdateUsernameResponse {
  success: boolean;
  message: string;
  newUsername: string;
}

// API fucntions

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

export async function logout() {
  const res = await apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "خروج ناموفق بود");
    throw new HttpError(res.message || "logout failed", 400, res);
  }

  return res;
}

export async function user_profile() {
  const res = await apiFetch<ApiResponse<User>>("/user/profile", {
    method: "GET",
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "دریافت اطلاعات کاربر ناموفق بود");
    throw new HttpError(res.message || "getting user profile failed", 400, res);
  }

  return res;
}

export async function updateEmail(newEmail: string) {
  const res = await apiFetch<UpdateEmailResponse>("/user/updateEmail", {
    method: "PUT",
    body: {
      email: newEmail,
    },
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "بروزرسانی ایمیل ناموفق بود");
    throw new HttpError(res.message || "updating email failed", 400, res);
  }

  return res;
}

export async function updatePhone(newPhone: string) {
  const res = await apiFetch<UpdatePhoneResponse>("/user/updatePhone", {
    method: "PUT",
    body: {
      phone: newPhone,
    },
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "بروزرسانی تلفن ناموفق بود");
    throw new HttpError(res.message || "updating phone failed", 400, res);
  }

  return res;
}

export async function updateUsername(newUsername: string) {
  const res = await apiFetch<UpdateUsernameResponse>("/user/updateUsername", {
    method: "PUT",
    body: {
      username: newUsername,
    },
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    toast.error(res.message || "بروزرسانی نام کاربری ناموفق بود");
    throw new HttpError(res.message || "updating username failed", 400, res);
  }

  return res;
}
