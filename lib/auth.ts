// Client-side admin auth helpers.
//
// Admin auth now rides on the same HttpOnly `kk_session` cookie used
// for customer auth — set by the backend on /api/auth/login, sent
// automatically by the browser on credentialed fetches, never
// visible to JavaScript. These functions remain for backward
// compatibility with the ~40 admin pages that call
// `adminFetch(path, getToken() || "", opts)`; the token argument is
// ignored by adminFetch (the cookie carries auth).
//
// We also clean up any legacy `kk_admin_token` left in localStorage
// on first read so refreshing the page doesn't keep a stale token
// laying around where stored XSS could read it.

const LEGACY_TOKEN_KEY = "kk_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Sweep out any leftover localStorage token from the pre-cookie
  // era — once cleaned, this returns null going forward, which
  // adminFetch happily ignores in favour of the session cookie.
  if (localStorage.getItem(LEGACY_TOKEN_KEY)) {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
  return null;
}

export function setToken(_token: string): void {
  // No-op. Auth state lives in the HttpOnly cookie set by the
  // backend on login; we keep the signature so old callers
  // (admin login form, invite acceptance) compile unchanged.
  if (typeof window !== "undefined") {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  // The cookie is cleared server-side by POST /api/auth/logout;
  // this just sweeps the legacy localStorage key.
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}
