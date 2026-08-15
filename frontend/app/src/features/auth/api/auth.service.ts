import { HttpError } from "@/shared/lib/api/core/errors";
import { apiFetch } from "@/shared/lib/api/core/http";

export interface LogoutResponse {
  message: string;
  success: string;
}

// type: register, login
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

// API functions

export async function register(input: RegisterInput) {
  const res = await apiFetch<ApiResponse<User>>("/auth/register", {
    method: "POST",
    body: input,
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
    throw new HttpError(res.message || "ورود ناموفق بود", 400, res);
  }

  return res;
}

export async function logout() {
  const res = await apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "خروج ناموفق بود", 400, res);
  }

  return res;
}
