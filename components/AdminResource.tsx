"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { SkeletonTableRows } from "@/components/Skeleton";
import StatusToggle from "@/components/StatusToggle";

export type ResourceFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "select"
  | "image"
  | "status";

export interface ResourceField {
  name: string;
  label: string;
  type?: ResourceFieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
}

export interface ResourceColumn {
  name: string;
  label: string;
}

interface AdminResourceProps {
  title: string;
  description?: string;
  endpoint: string;
  fields: ResourceField[];
  columns: ResourceColumn[];
  newLabel?: string;
}

type Row = Record<string, unknown> & { id: number };

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

function emptyForm(fields: ResourceField[]): Record<string, string> {
  const f: Record<string, string> = {};
  for (const field of fields) {
    f[field.name] =
      field.type === "select" && field.options?.length
        ? field.options[0].value
        : field.type === "number"
          ? "0"
          : field.type === "status"
            ? "published"
            : "";
  }
  return f;
}

function Badge({ value }: { value: string }) {
  const tone =
    value === "published"
      ? "bg-green-100 text-green-800"
      : value === "draft"
        ? "bg-amber-100 text-amber-800"
        : "bg-ink/10 text-ink/70";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {value}
    </span>
  );
}

// AdminResource renders a list + inline create/edit form for a simple,
// flat content type (services, projects, testimonials, stats).
export default function AdminResource({
  title,
  description,
  endpoint,
  fields,
  columns,
  newLabel = "New item",
}: AdminResourceProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string>>(emptyForm(fields));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch(endpoint, getToken() || "");
      if (!res.ok) throw new Error("Failed to load");
      setRows((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm(emptyForm(fields));
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (row: Row) => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const v = row[field.name];
      next[field.name] = v === null || v === undefined ? "" : String(v);
    }
    setForm(next);
    setEditingId(row.id);
    setShowForm(true);
  };

  const setField = (name: string, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  const upload = async (name: string, file: File) => {
    setUploading(name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setField(name, data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading("");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        payload[field.name] =
          field.type === "number"
            ? Number(form[field.name] || 0)
            : form[field.name];
      }
      const res = await adminFetch(
        editingId ? `${endpoint}/${editingId}` : endpoint,
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

  const remove = async (row: Row) => {
    if (!confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}?`))
      return;
    const res = await adminFetch(
      `${endpoint}/${row.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setRows((r) => r.filter((x) => x.id !== row.id));
    else alert("Could not delete.");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-ink/50">{description}</p>
          )}
        </div>
        <button
          onClick={startNew}
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + {newLabel}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            {editingId ? "Edit" : "Create"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.full ||
                  field.type === "textarea" ||
                  field.type === "richtext" ||
                  field.type === "image"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <label className="text-sm font-medium text-ink/70">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    required={field.required}
                    value={form[field.name]}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                ) : field.type === "richtext" ? (
                  <div className="mt-1">
                    <RichTextEditor
                      value={form[field.name]}
                      onChange={(html) => setField(field.name, html)}
                    />
                  </div>
                ) : field.type === "select" ? (
                  <select
                    value={form[field.name]}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  >
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "status" ? (
                  <div className="mt-1">
                    <StatusToggle
                      value={form[field.name]}
                      onChange={(v) => setField(field.name, v)}
                    />
                  </div>
                ) : field.type === "image" ? (
                  <div className="mt-1">
                    {form[field.name] && (
                       
                      <img
                        src={imageUrl(form[field.name])}
                        alt="preview"
                        className="mb-2 h-32 w-full rounded-lg object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(field.name, file);
                      }}
                      className="text-sm"
                    />
                    {uploading === field.name && (
                      <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-ink/50">
                        <Spinner size="sm" className="text-brand-500" />
                        Uploading…
                      </span>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    required={field.required}
                    value={form[field.name]}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                )}
              </div>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading !== ""}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-50"
            >
              {saving && <Spinner size="sm" />}
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

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={4} columns={Math.max(2, columns.length + 1)} />
        </div>
      )}
      {error && !showForm && (
        <p className="mt-8 text-red-600">{error}</p>
      )}
      {!loading && rows.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="✨"
          title={`No ${title.toLowerCase()} yet`}
          description={`Create your first ${title.toLowerCase().replace(/s$/, "")} to get started.`}
          action={{ onClick: startNew, label: `+ ${newLabel}` }}
        />
      )}

      {!loading && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                {columns.map((c) => (
                  <th key={c.name} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink/[0.02]">
                  {columns.map((c) => {
                    const value = row[c.name];
                    const text =
                      value === null || value === undefined
                        ? "—"
                        : String(value);
                    return (
                      <td key={c.name} className="px-4 py-3 text-ink/80">
                        {c.name === "status" ? (
                          <Badge value={text} />
                        ) : (
                          <span className="line-clamp-1">{text || "—"}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => startEdit(row)}
                      className="text-ink/70 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(row)}
                      className="ml-4 text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
