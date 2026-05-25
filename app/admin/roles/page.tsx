"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import { LoadingBlock } from "@/components/Spinner";

interface Role {
  id: number;
  key: string;
  name: string;
  description: string;
  isBuiltin: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ResourceGroup {
  resource: string;
  label: string;
  category: string;
  permissions: string[]; // permission keys
}

interface PermissionDef {
  key: string;
  resource: string;
  action: string;
  label: string;
  description: string;
}

interface CatalogPayload {
  all: PermissionDef[];
  resources: ResourceGroup[];
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const ACTION_LABEL: Record<string, string> = {
  view: "View",
  manage: "Manage",
  invite: "Invite staff",
};

export default function AdminRolesPage() {
  const { can, user: me, refresh } = useAdminSession();
  const canManage = can("roles.manage");

  const [roles, setRoles] = useState<Role[]>([]);
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    description: string;
    permissions: Set<string>;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken() || "";
      const [r, p] = await Promise.all([
        adminFetch("/api/admin/roles", token),
        adminFetch("/api/admin/permissions", token),
      ]);
      if (r.ok) {
        const list: Role[] = await r.json();
        setRoles(list);
        if (selectedId == null && list.length > 0) {
          setSelectedId(list[0].id);
        }
      }
      if (p.ok) setCatalog(await p.json());
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => roles.find((r) => r.id === selectedId) || null,
    [roles, selectedId],
  );

  // Reset the editor when the selected role changes or we leave "creating".
  useEffect(() => {
    if (creating) {
      setDraft({
        name: "",
        description: "",
        permissions: new Set(),
      });
      return;
    }
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft({
      name: selected.name,
      description: selected.description,
      permissions: new Set(selected.permissions),
    });
  }, [selected, creating]);

  const togglePerm = (key: string) => {
    if (!draft) return;
    const next = new Set(draft.permissions);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDraft({ ...draft, permissions: next });
  };

  const toggleResource = (group: ResourceGroup) => {
    if (!draft) return;
    const all = group.permissions;
    const hasAll = all.every((p) => draft.permissions.has(p));
    const next = new Set(draft.permissions);
    if (hasAll) all.forEach((p) => next.delete(p));
    else all.forEach((p) => next.add(p));
    setDraft({ ...draft, permissions: next });
  };

  const grouped = useMemo(() => {
    if (!catalog) return [];
    const byCategory: Record<string, ResourceGroup[]> = {};
    for (const g of catalog.resources) {
      (byCategory[g.category] ||= []).push(g);
    }
    return Object.entries(byCategory);
  }, [catalog]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const token = getToken() || "";
      const body = JSON.stringify({
        name: draft.name,
        description: draft.description,
        permissions: Array.from(draft.permissions),
      });
      const res = creating
        ? await adminFetch("/api/admin/roles", token, {
            method: "POST",
            body,
          })
        : await adminFetch(`/api/admin/roles/${selected!.id}`, token, {
            method: "PUT",
            body,
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      if (creating) {
        setRoles((list) => [...list, data]);
        setSelectedId(data.id);
        setCreating(false);
      } else {
        setRoles((list) => list.map((r) => (r.id === data.id ? data : r)));
      }
      // If we updated our own role, refresh permissions.
      if (!creating && me?.roleId === data.id) refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Delete the "${selected.name}" role?`)) return;
    const res = await adminFetch(
      `/api/admin/roles/${selected.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete");
      return;
    }
    setRoles((list) => list.filter((r) => r.id !== selected.id));
    setSelectedId(roles[0]?.id ?? null);
  };

  // Admin role is read-only; built-ins are editable (perms only) by users with roles.manage.
  const isAdminRole = selected?.key === "admin";
  const editingDisabled = !canManage || (isAdminRole && !creating);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Roles &amp; permissions
          </h1>
          <p className="text-sm text-ink/50">
            Pick what each role can see and do in the admin. Built-in roles
            can be tuned; the Admin role always has every permission.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setCreating(true);
              setSelectedId(null);
            }}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New custom role
          </button>
        )}
      </div>

      {loading ? (
        <LoadingBlock label="Loading roles…" />
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="space-y-1">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setCreating(false);
                  setSelectedId(r.id);
                }}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                  !creating && selectedId === r.id
                    ? "border-brand-400 bg-brand-50/60"
                    : "border-ink/10 bg-white hover:border-brand-200"
                }`}
              >
                <p className="text-sm font-semibold text-ink">{r.name}</p>
                <p className="text-xs text-ink/55">
                  {r.userCount} user{r.userCount === 1 ? "" : "s"} ·{" "}
                  {r.permissions.length} perm
                  {r.permissions.length === 1 ? "" : "s"}
                </p>
                {r.isBuiltin && (
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-600">
                    Built-in
                  </p>
                )}
              </button>
            ))}
            {creating && (
              <div className="rounded-xl border border-brand-400 bg-brand-50/60 px-3 py-2.5">
                <p className="text-sm font-semibold text-ink">New role</p>
                <p className="text-xs text-ink/55">Unsaved</p>
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-ink/10 bg-white p-6">
            {!draft ? (
              <p className="text-ink/50">Select a role on the left.</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-ink/70">
                      Role name
                    </label>
                    <input
                      value={draft.name}
                      disabled={editingDisabled}
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                      }
                      className={inputClass}
                      placeholder="e.g. Content reviewer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink/70">
                      Description
                    </label>
                    <input
                      value={draft.description}
                      disabled={editingDisabled}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                      className={inputClass}
                      placeholder="What this role is for"
                    />
                  </div>
                </div>

                {isAdminRole && !creating && (
                  <p className="mt-4 rounded-lg bg-ink/5 px-3 py-2 text-xs text-ink/55">
                    The Admin role is locked — it always holds every
                    permission and can&apos;t be edited or deleted.
                  </p>
                )}

                <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-ink/45">
                  Permissions
                </h3>

                <div className="mt-3 space-y-6">
                  {grouped.map(([category, groups]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                        {category}
                      </p>
                      <div className="mt-2 overflow-hidden rounded-xl border border-ink/10">
                        <table className="w-full text-sm">
                          <thead className="bg-ink/[0.02] text-left text-xs uppercase tracking-widest text-ink/40">
                            <tr>
                              <th className="px-3 py-2">Resource</th>
                              <th className="px-3 py-2">Actions</th>
                              <th className="w-20 px-3 py-2 text-right">All</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groups.map((group) => {
                              const all = group.permissions;
                              const hasAll = all.every((p) =>
                                draft.permissions.has(p),
                              );
                              return (
                                <tr
                                  key={group.resource}
                                  className="border-t border-ink/5"
                                >
                                  <td className="px-3 py-2 align-top font-medium text-ink/80">
                                    {group.label}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex flex-wrap gap-2">
                                      {group.permissions.map((key) => {
                                        const action =
                                          catalog!.all.find((p) => p.key === key)
                                            ?.action || key;
                                        const checked =
                                          draft.permissions.has(key);
                                        return (
                                          <label
                                            key={key}
                                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                                              checked
                                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                                : "border-ink/15 bg-white text-ink/55 hover:border-brand-300"
                                            } ${editingDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              disabled={editingDisabled}
                                              onChange={() => togglePerm(key)}
                                              className="hidden"
                                            />
                                            <span>
                                              {ACTION_LABEL[action] || action}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      type="button"
                                      disabled={editingDisabled}
                                      onClick={() => toggleResource(group)}
                                      className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-40"
                                    >
                                      {hasAll ? "Clear" : "Select all"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                )}

                {!editingDisabled && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={save}
                      disabled={saving || !draft.name.trim()}
                      className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {saving
                        ? "Saving…"
                        : creating
                          ? "Create role"
                          : "Save changes"}
                    </button>
                    {!creating && selected && !selected.isBuiltin && (
                      <button
                        onClick={remove}
                        className="text-sm font-medium text-red-700 hover:underline"
                      >
                        Delete role
                      </button>
                    )}
                    {creating && (
                      <button
                        onClick={() => {
                          setCreating(false);
                          setSelectedId(roles[0]?.id ?? null);
                        }}
                        className="text-sm font-medium text-ink/60 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                    {selected && !creating && (
                      <p className="ml-auto text-xs text-ink/45">
                        Updated {formatDate(selected.updatedAt)}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
