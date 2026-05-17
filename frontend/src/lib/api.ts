const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE = configuredApiBase
  ? configuredApiBase.replace(/\/$/, "")
  : "/api";

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
