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
import { getToken, clearToken } from "./auth";

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
  signOut: () => void;
}

const Ctx = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        clearToken();
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

  const signOut = useCallback(() => {
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
