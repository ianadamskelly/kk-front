"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, ContactSubmission, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

const STATUS_TONE: Record<string, string> = {
  new: "bg-brand-100 text-brand-700",
  read: "bg-ink/10 text-ink/70",
  archived: "bg-ink/5 text-ink/40",
};

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/submissions", getToken() || "");
      if (!res.ok) throw new Error("Failed to load messages");
      setItems((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (item: ContactSubmission, status: string) => {
    const res = await adminFetch(
      `/api/admin/submissions/${item.id}`,
      getToken() || "",
      { method: "PUT", body: JSON.stringify({ status }) },
    );
    if (res.ok) {
      setItems((list) =>
        list.map((x) =>
          x.id === item.id
            ? { ...x, status: status as ContactSubmission["status"] }
            : x,
        ),
      );
    }
  };

  const remove = async (item: ContactSubmission) => {
    if (!confirm(`Delete the message from ${item.name}?`)) return;
    const res = await adminFetch(
      `/api/admin/submissions/${item.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setItems((list) => list.filter((x) => x.id !== item.id));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Contact messages
      </h1>
      <p className="text-sm text-ink/50">
        Enquiries submitted through the contact form.
      </p>

      {loading && <LoadingBlock label="Loading messages…" />}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="✉️"
          title="No messages yet"
          description="When someone reaches out through the contact form their note will appear here."
        />
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-sm text-ink/60">
                    <a
                      href={`mailto:${item.email}`}
                      className="hover:text-brand-600"
                    >
                      {item.email}
                    </a>
                    {item.phone && ` · ${item.phone}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_TONE[item.status] || STATUS_TONE.read
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {(item.service || item.subject) && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-500">
                  {[item.service, item.subject].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">
                {item.message}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                <span className="text-xs text-ink/40">
                  {formatDate(item.createdAt)}
                </span>
                <div className="flex gap-3">
                  {item.status !== "read" && (
                    <button
                      onClick={() => setStatus(item, "read")}
                      className="text-ink/70 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  {item.status !== "archived" && (
                    <button
                      onClick={() => setStatus(item, "archived")}
                      className="text-ink/70 hover:underline"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => remove(item)}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
