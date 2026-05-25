"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, imageUrl, TeamMember } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const SOCIAL_KEYS = ["linkedin", "twitter", "instagram", "dribbble"];

const EMPTY = {
  name: "",
  role: "",
  photo: "",
  bio: "",
  sortOrder: "0",
  linkedin: "",
  twitter: "",
  instagram: "",
  dribbble: "",
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/team", getToken() || "");
      if (!res.ok) throw new Error("Failed to load team");
      setMembers((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const startNew = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (m: TeamMember) => {
    setForm({
      name: m.name,
      role: m.role,
      photo: m.photo,
      bio: m.bio,
      sortOrder: String(m.sortOrder),
      linkedin: m.socials?.linkedin || "",
      twitter: m.socials?.twitter || "",
      instagram: m.socials?.instagram || "",
      dribbble: m.socials?.dribbble || "",
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set("photo", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const socials: Record<string, string> = {};
      for (const key of SOCIAL_KEYS) {
        const v = form[key as keyof typeof EMPTY];
        if (v) socials[key] = v;
      }
      const payload = {
        name: form.name,
        role: form.role,
        photo: form.photo,
        bio: form.bio,
        sortOrder: Number(form.sortOrder || 0),
        socials,
      };
      const res = await adminFetch(
        editingId ? `/api/admin/team/${editingId}` : "/api/admin/team",
        getToken() || "",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: TeamMember) => {
    if (!confirm(`Remove ${m.name} from the team?`)) return;
    const res = await adminFetch(
      `/api/admin/team/${m.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setMembers((list) => list.filter((x) => x.id !== m.id));
    else alert("Could not delete.");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Team
          </h1>
          <p className="text-sm text-ink/50">
            People shown on the About page.
          </p>
        </div>
        <button
          onClick={startNew}
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New member
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            {editingId ? "Edit member" : "New member"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink/70">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Role</label>
              <input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">Photo</label>
              <div className="mt-1">
                {form.photo && (
                   
                  <img
                    src={imageUrl(form.photo)}
                    alt="preview"
                    className="mb-2 h-24 w-24 rounded-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                  }}
                  className="text-sm"
                />
                {uploading && (
                  <span className="ml-2 text-xs text-ink/50">Uploading…</span>
                )}
              </div>
            </div>
            {SOCIAL_KEYS.map((key) => (
              <div key={key}>
                <label className="text-sm font-medium capitalize text-ink/70">
                  {key} URL
                </label>
                <input
                  value={form[key as keyof typeof EMPTY]}
                  onChange={(e) =>
                    set(key as keyof typeof EMPTY, e.target.value)
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-ink/70">
                Sort order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError("");
              }}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <LoadingBlock label="Loading team…" />}
      {!loading && members.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="👤"
          title="No team members yet"
          description="Add your first team member so visitors can put a face to your brand."
          action={{ onClick: startNew, label: "+ Add member" }}
        />
      )}

      {!loading && members.length > 0 && (
        <ul className="mt-6 divide-y divide-ink/[0.06] rounded-2xl border border-ink/10 bg-white">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-50">
                  {m.photo ? (
                     
                    <img
                      src={imageUrl(m.photo)}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-400">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-ink/50">{m.role}</p>
                </div>
              </div>
              <div className="whitespace-nowrap text-sm">
                <button
                  onClick={() => startEdit(m)}
                  className="text-ink/70 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(m)}
                  className="ml-4 text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
