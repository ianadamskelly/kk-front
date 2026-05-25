"use client";

import { useEffect, useState } from "react";
import { adminFetch, API_URL, Category } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonLine } from "@/components/Skeleton";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        setCategories(res.ok ? await res.json() : []);
      } catch {
        setError("Could not load categories.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await adminFetch("/api/admin/categories", getToken() || "", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add the category");
      return;
    }
    setCategories((current) =>
      [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setName("");
  };

  const remove = async (cat: Category) => {
    if (
      !confirm(
        `Delete category "${cat.name}"? Posts in it will simply lose this category.`,
      )
    )
      return;
    const res = await adminFetch(
      `/api/admin/categories/${cat.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) {
      setCategories((current) => current.filter((c) => c.id !== cat.id));
    } else {
      alert("Could not delete the category.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Categories
      </h1>
      <p className="text-sm text-ink/50">
        Group your insights so readers can browse by topic.
      </p>

      <form onSubmit={add} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="New category name"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <ul className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3"
            >
              <SkeletonLine className="w-32" />
              <SkeletonLine className="w-12" />
            </li>
          ))}
        </ul>
      ) : categories.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="🏷️"
          title="No categories yet"
          description="Add your first category above to group your insights by topic."
        />
      ) : (
        <ul className="mt-6 divide-y divide-ink/[0.06] rounded-2xl border border-ink/10 bg-white">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <span className="font-medium text-ink">{c.name}</span>
                <span className="ml-2 text-xs text-ink/40">/{c.slug}</span>
              </div>
              <button
                onClick={() => remove(c)}
                className="text-sm text-red-700 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
