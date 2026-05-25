"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { SkeletonTableRows } from "@/components/Skeleton";

interface Role {
  id: number;
  key: string;
  name: string;
  isBuiltin: boolean;
}

interface StaffUser {
  id: number;
  email: string;
  name: string;
  role: string;
  roleId: number | null;
  roleKey: string;
  roleName: string;
  createdAt: string;
}

interface Invite {
  id: number;
  email: string;
  name: string;
  roleId: number;
  roleName: string;
  roleKey: string;
  token: string;
  inviteUrl: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  status: "pending" | "accepted" | "expired";
  emailSent?: boolean;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  expired: "bg-ink/10 text-ink/50",
};

export default function AdminUsersPage() {
  const { user: me, can, refresh } = useAdminSession();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", name: "", roleId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [lastInvite, setLastInvite] = useState<Invite | null>(null);

  const canInvite = can(["users.invite", "users.manage"]);
  const canManage = can("users.manage");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken() || "";
      const [u, i, r] = await Promise.all([
        adminFetch("/api/admin/users", token),
        adminFetch("/api/admin/invitations", token),
        adminFetch("/api/admin/roles", token),
      ]);
      if (u.ok) setUsers(await u.json());
      if (i.ok) setInvites(await i.json());
      if (r.ok) setRoles(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invitableRoles = useMemo(
    () => roles.filter((r) => r.key !== "admin" || canManage),
    [roles, canManage],
  );

  // Default the role picker to the first invitable role once roles load.
  useEffect(() => {
    if (!form.roleId && invitableRoles.length > 0) {
      setForm((f) => ({ ...f, roleId: String(invitableRoles[0].id) }));
    }
  }, [invitableRoles, form.roleId]);

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setLastInvite(null);
    try {
      const res = await adminFetch(
        "/api/admin/invitations",
        getToken() || "",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            name: form.name,
            roleId: Number(form.roleId),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send invite");
      setLastInvite(data);
      setInvites((list) => [data, ...list.filter((i) => i.id !== data.id)]);
      setForm((f) => ({ ...f, email: "", name: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeRole = async (u: StaffUser, roleId: number) => {
    const res = await adminFetch(`/api/admin/users/${u.id}`, getToken() || "", {
      method: "PUT",
      body: JSON.stringify({ roleId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not change role");
      return;
    }
    setUsers((list) =>
      list.map((x) =>
        x.id === u.id
          ? { ...x, roleId, roleKey: data.roleKey, roleName: data.roleName, role: data.roleKey }
          : x,
      ),
    );
    if (u.id === me?.id) {
      // Our own permissions may have changed — refresh the session.
      refresh();
    }
  };

  const removeUser = async (u: StaffUser) => {
    if (!confirm(`Remove ${u.email} from the staff?`)) return;
    const res = await adminFetch(`/api/admin/users/${u.id}`, getToken() || "", {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete user");
      return;
    }
    setUsers((list) => list.filter((x) => x.id !== u.id));
  };

  const revokeInvite = async (inv: Invite) => {
    if (!confirm(`Revoke invite for ${inv.email}?`)) return;
    const res = await adminFetch(
      `/api/admin/invitations/${inv.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setInvites((list) => list.filter((i) => i.id !== inv.id));
  };

  const copy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        // Soft feedback — we don't add a full toast for this one action.
        const el = document.getElementById(`copied-${text.length}`);
        if (el) {
          el.textContent = "Copied!";
          setTimeout(() => (el.textContent = "Copy link"), 1500);
        }
      })
      .catch(() => alert(text));
  };

  const pending = invites.filter((i) => i.status !== "accepted");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Staff users
      </h1>
      <p className="text-sm text-ink/50">
        Invite teammates and assign them a role. Roles decide which parts of
        the admin they can see.
      </p>

      {canInvite && (
        <form
          onSubmit={submitInvite}
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Invite a new staff member
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-ink/70">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Name (optional)
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Role</label>
              <select
                required
                value={form.roleId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roleId: e.target.value }))
                }
                className={inputClass}
              >
                {invitableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting && <Spinner size="sm" />}
            {submitting ? "Sending…" : "Send invitation"}
          </button>
          {lastInvite && (
            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-sm">
              <p className="font-medium text-ink">
                Invite created for {lastInvite.email}
                {lastInvite.emailSent ? " — email sent." : " — share this link:"}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <code className="flex-1 truncate rounded-md bg-white px-3 py-2 text-xs text-ink/70">
                  {lastInvite.inviteUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copy(lastInvite.inviteUrl)}
                  className="rounded-full border border-brand-500 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                >
                  Copy link
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink/45">
        Members ({users.length})
      </h2>
      {loading && (
        <div className="mt-3">
          <SkeletonTableRows rows={3} columns={4} />
        </div>
      )}
      {!loading && users.length === 0 && (
        <EmptyState
          className="mt-4"
          icon="👥"
          title="No staff users yet"
          description="You're the only one here. Invite teammates above to give them access."
          variant="inline"
        />
      )}

      {users.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-left text-xs uppercase tracking-widest text-ink/45">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Joined</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-ink/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {u.name || "—"}{" "}
                      {u.id === me?.id && (
                        <span className="text-xs text-ink/40">(you)</span>
                      )}
                    </p>
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs text-ink/55 hover:text-brand-600"
                    >
                      {u.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && u.id !== me?.id ? (
                      <select
                        value={u.roleId ?? ""}
                        onChange={(e) =>
                          changeRole(u, Number(e.target.value))
                        }
                        className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {u.roleName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/55">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage && u.id !== me?.id && (
                      <button
                        onClick={() => removeUser(u)}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink/45">
        Pending invitations
      </h2>
      {pending.length === 0 && !loading && (
        <p className="mt-3 text-sm text-ink/50">
          No pending invitations. Everyone you&apos;ve invited has accepted (or
          none yet).
        </p>
      )}
      {pending.length > 0 && (
        <ul className="mt-4 space-y-3">
          {pending.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {inv.email}{" "}
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                </p>
                <p className="text-xs text-ink/55">
                  {inv.roleName} · expires {formatDate(inv.expiresAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => copy(inv.inviteUrl)}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/65 hover:border-brand-400"
                >
                  Copy link
                </button>
                {canManage && (
                  <button
                    onClick={() => revokeInvite(inv)}
                    className="text-sm text-red-700 hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
