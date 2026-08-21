import { toast } from "sonner";
import { makeApiUrl } from "./config";
import { HttpError, getErrorMessage } from "./errors";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function withQuery(url: string, query?: ApiFetchOptions["query"]) {
  if (!query) return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

/**
 * Typed fetch wrapper used by every frontend API service.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, query, headers, ...init } = options;

  const url = withQuery(makeApiUrl(path), query);
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
        handleUnauthorized();
      }
    }

    throw new HttpError(
      getErrorMessage(data, response),
      response.status,
      data,
    );
  }

  return data as T;
}

function handleUnauthorized() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
  window.dispatchEvent(new Event("auth:logout"));

  if (window.location.pathname !== "/signin") {
    window.location.replace("/signin");
  }
}
