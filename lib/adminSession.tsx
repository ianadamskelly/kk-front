"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "./api";
import { clearToken } from "./auth";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  roleId: number | null;
  roleKey?: string;
  roleName?: string;
  permissions: string[];
  createdAt: string;
}

interface AdminSession {
  user: AdminUser | null;
  loading: boolean;
  // `can` is the workhorse: pass a permission key (or array — meaning OR).
  // Admins implicitly hold every permission via the seed, so we don't
  // special-case the role here.
  can: (perm: string | string[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Auth rides the HttpOnly session cookie now — sent
      // automatically when credentials: 'include' is set. No
      // localStorage token check needed; the server's response
      // tells us whether we're signed in.
      const res = await fetch(`${API_URL}/api/admin/me`, {
        credentials: "include",
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        clearToken(); // sweep any legacy localStorage entry
        setUser(null);
      }
    } catch {
      // Network blip — keep the previous session so a transient failure
      // doesn't bounce a working admin to login.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const can = useCallback(
    (perm: string | string[]) => {
      if (!user) return false;
      const wanted = Array.isArray(perm) ? perm : [perm];
      return wanted.some((p) => user.permissions.includes(p));
    },
    [user],
  );

  const signOut = useCallback(async () => {
    // Tell the server to clear the HttpOnly cookie. Best-effort —
    // even if the call fails, we still null the local user so the
    // UI bounces to login.
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore — proceed with local clear.
    }
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AdminSession>(
    () => ({ user, loading, can, refresh, signOut }),
    [user, loading, can, refresh, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSession(): AdminSession {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAdminSession must be used inside AdminSessionProvider");
  }
  return ctx;
}
