"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, imageUrl, formatPrice, Product } from "@/lib/api";
import { getToken } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { SkeletonTableRows } from "@/components/Skeleton";

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const EMPTY = {
  name: "",
  description: "",
  body: "",
  price: "0",
  image: "",
  category: "",
  sortOrder: "0",
  status: "published",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
      const res = await adminFetch("/api/admin/products", getToken() || "");
      if (!res.ok) throw new Error("Failed to load products");
      setProducts((await res.json()) || []);
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

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      body: p.body,
      price: String(p.priceCents / 100),
      image: p.image,
      category: p.category,
      sortOrder: String(p.sortOrder),
      status: p.status,
    });
    setEditingId(p.id);
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
      set("image", data.url);
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
      const payload = {
        name: form.name,
        description: form.description,
        body: form.body,
        priceCents: Math.round(Number(form.price || 0) * 100),
        image: form.image,
        category: form.category,
        sortOrder: Number(form.sortOrder || 0),
        status: form.status,
      };
      const res = await adminFetch(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
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

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const res = await adminFetch(
      `/api/admin/products/${p.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setProducts((list) => list.filter((x) => x.id !== p.id));
    else alert("Could not delete.");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Products
          </h1>
          <p className="text-sm text-ink/50">Items sold in the shop.</p>
        </div>
        <button
          onClick={startNew}
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New product
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            {editingId ? "Edit product" : "New product"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink/70">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Price (KSh)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Sort order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">
                Short description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">
                Full description
              </label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.body}
                  onChange={(html) => set("body", html)}
                  placeholder="Detailed product description…"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">Image</label>
              <div className="mt-1">
                {form.image && (
                  <img
                    src={imageUrl(form.image)}
                    alt="preview"
                    className="mb-2 h-32 w-32 rounded-lg object-cover"
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
                  <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-ink/50">
                    <Spinner size="sm" className="text-brand-500" />
                    Uploading…
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
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
          <SkeletonTableRows rows={4} columns={5} />
        </div>
      )}
      {!loading && products.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="🛍️"
          title="No products yet"
          description="Add your first product to start selling in the shop."
          action={{ onClick: startNew, label: "+ New product" }}
        />
      )}

      {!loading && products.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {p.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {formatPrice(p.priceCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "published"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-ink/70 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p)}
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
