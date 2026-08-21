const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "";

export function makeApiUrl(path: string) {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE is not configured. Create frontend/app/.env.local from the repository .env.example file.",
    );
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api${cleanPath}`;
}
