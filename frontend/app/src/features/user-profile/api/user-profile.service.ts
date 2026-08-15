import { HttpError } from "@/shared/lib/api/core/errors";
import { apiFetch } from "@/shared/lib/api/core/http";
import { ApiResponse, User } from "@/features/auth/api";

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

// API functions

export async function user_profile() {
  const res = await apiFetch<ApiResponse<User>>("/user/profile", {
    method: "GET",
  });

  // if api status is 2xx but success is false throw err.
  if (!res.success) {
    throw new HttpError(res.message || "دریافت اطلاعات کاربر ناموفق بود", 400, res);
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
    throw new HttpError(res.message || "بروزرسانی ایمیل ناموفق بود", 400, res);
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
    throw new HttpError(res.message || "بروزرسانی تلفن ناموفق بود", 400, res);
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
    throw new HttpError(res.message || "بروزرسانی نام کاربری ناموفق بود", 400, res);
  }

  return res;
}
