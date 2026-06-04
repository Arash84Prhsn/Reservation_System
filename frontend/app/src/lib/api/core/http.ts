import { toast } from "sonner";
import { makeApiUrl } from "./config";
import { HttpError, getErrorMessage } from "./errors";

// type Json = Record<string, unknown>;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown; // object -> JSON.stringify
  query?: Record<string, string | number | boolean | undefined | null>;
};

function withQuery(url: string, query?: ApiFetchOptions["query"]) {
  if (!query) return url;
  const u = new URL(url, "http://dummy-base"); // برای ساخت query بدون توجه به origin
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    u.searchParams.set(k, String(v));
  });
  return url.includes("?")
    ? `${url}&${u.searchParams}`
    : `${url}?${u.searchParams}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, query, headers, ...init } = options;

  let url = makeApiUrl(path);
  url = withQuery(url, query);

  const res = await fetch(url, {
    ...init,
    // برای session-cookie لازم است (به‌خصوص اگر dev جدا یا subdomain شد)
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  // anything that is not 2xx is considered an error (Except 401 )
  if (!res.ok) {
    if (res.status === 401) {
      toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");

      handleUnauthorized();

      throw new HttpError(getErrorMessage(data, res), res.status, data);
    }

    toast.error(getErrorMessage(data, res) || "خطا در ارتباط با سرور");
    throw new HttpError(getErrorMessage(data, res), res.status, data);
  }

  return data as T;
}

// helpers
function handleUnauthorized() {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");

  window.dispatchEvent(new Event("auth:logout"));

  if (window.location.pathname !== "/signin") {
    window.location.href = "/signin";
  }
}
