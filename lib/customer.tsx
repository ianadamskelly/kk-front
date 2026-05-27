"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL, User } from "@/lib/api";

// Customer auth now rides on an HttpOnly `kk_session` cookie set by
// the backend on /api/auth/login + /api/auth/register. The browser
// sends the cookie automatically on every cross-origin fetch that
// uses credentials: 'include' (see customerFetch helper below) —
// the SPA never sees the JWT, so a stored-XSS payload can't read
// it. The cookie was previously a localStorage token, which was
// readable by any script in the page.

interface AuthResult {
  user: User;
}

interface CustomerContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    referralCode?: string,
    source?: string,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Re-pull /auth/me. Useful after a flow that may have created
   *  a session out-of-band (e.g. checkout-side inline signup). */
  refresh: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

// customerFetch wraps fetch with credentials: 'include' so the
// kk_session cookie rides along. Use it for every customer-side call.
export function customerFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_URL}${path}`, { ...init, credentials: "include" });
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await customerFetch(`/api/auth/me`);
      if (!res.ok) {
        setUser(null);
        return;
      }
      const u = (await res.json()) as User;
      if (u && u.role === "customer") {
        setUser(u);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // On mount, ask the server who we are. The cookie is sent
  // automatically; a 401/empty response just means "not signed in".
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const res = await customerFetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user && data.user.role !== "customer") {
        throw new Error(
          "Admin accounts sign in via /admin. Use a customer account here.",
        );
      }
      setUser(data.user);
      return { user: data.user };
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      referralCode?: string,
      source?: string,
    ): Promise<AuthResult> => {
      const res = await customerFetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setUser(data.user);
      return { user: data.user };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await customerFetch(`/api/auth/logout`, { method: "POST" });
    } catch {
      // Best-effort — even if the network call fails the cookie may
      // already be invalid; clear the local state regardless.
    }
    setUser(null);
  }, []);

  const value = useMemo<CustomerContextValue>(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx)
    throw new Error("useCustomer must be used within a CustomerProvider");
  return ctx;
}
