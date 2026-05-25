"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, formatDate } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { SkeletonTableRows } from "@/components/Skeleton";
import RichTextEditor from "@/components/RichTextEditor";

interface Newsletter {
  id: number;
  subject: string;
  body: string;
  audienceTags: string[];
  audienceAll: boolean;
  status: "draft" | "sent";
  sentCount: number;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TagStat {
  tag: string;
  count: number;
}

interface TagStatsResp {
  tags: TagStat[];
  total: number;
}

const TAG_LABELS: Record<string, string> = {
  signup: "Account signup",
  newsletter: "Newsletter form",
  shop: "Shop buyers",
  courses: "Course buyers",
  course: "Course buyers",
  membership: "Members",
  customer: "All customers",
  website: "Website signups",
};

function labelFor(tag: string): string {
  return TAG_LABELS[tag] || tag;
}

export default function AdminNewslettersPage() {
  const { can } = useAdminSession();
  const canManage = can("newsletters.manage");

  const [items, setItems] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<TagStatsResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken() || "";
      const [n, s] = await Promise.all([
        adminFetch("/api/admin/newsletters", token),
        adminFetch("/api/admin/subscribers/tag-stats", token),
      ]);
      if (n.ok) setItems((await n.json()) || []);
      if (s.ok) setStats(await s.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tagOptions = useMemo<TagStat[]>(() => {
    return stats?.tags ?? [];
  }, [stats]);

  const startNew = () =>
    setEditing({
      id: 0,
      subject: "",
      body: "",
      audienceTags: [],
      audienceAll: true,
      status: "draft",
      sentCount: 0,
      sentAt: null,
      createdAt: "",
      updatedAt: "",
    });

  const toggleTag = (tag: string) => {
    if (!editing) return;
    const set = new Set(editing.audienceTags);
    if (set.has(tag)) set.delete(tag);
    else set.add(tag);
    setEditing({ ...editing, audienceTags: Array.from(set) });
  };

  // Estimated audience size for the current draft. Sum of subscriber counts
  // across the selected tags is approximate (could double-count people who
  // hold multiple selected tags) — the server is still the source of truth.
  const audienceEstimate = useMemo(() => {
    if (!editing || !stats) return 0;
    if (editing.audienceAll) return stats.total;
    return editing.audienceTags.reduce((sum, t) => {
      const row = stats.tags.find((s) => s.tag === t);
      return sum + (row?.count ?? 0);
    }, 0);
  }, [editing, stats]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        subject: editing.subject,
        body: editing.body,
        audienceAll: editing.audienceAll,
        audienceTags: editing.audienceTags,
      };
      const url = editing.id
        ? `/api/admin/newsletters/${editing.id}`
        : "/api/admin/newsletters";
      const res = await adminFetch(url, getToken() || "", {
        method: editing.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setEditing(data);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    if (!editing || !editing.id) return;
    if (
      !confirm(
        `Send "${editing.subject}" to ${audienceEstimate} subscriber${audienceEstimate === 1 ? "" : "s"}? This can't be undone.`,
      )
    )
      return;
    setSending(true);
    setError("");
    try {
      const res = await adminFetch(
        `/api/admin/newsletters/${editing.id}/send`,
        getToken() || "",
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setEditing(data);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send error");
    } finally {
      setSending(false);
    }
  };

  const remove = async (n: Newsletter) => {
    if (!confirm(`Delete "${n.subject}"?`)) return;
    const res = await adminFetch(
      `/api/admin/newsletters/${n.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) {
      setItems((list) => list.filter((x) => x.id !== n.id));
      if (editing?.id === n.id) setEditing(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Newsletters
          </h1>
          <p className="text-sm text-ink/50">
            Compose a campaign and send it to everyone, or target subscribers
            by how they joined the list.
          </p>
        </div>
        {canManage && !editing && (
          <button
            onClick={startNew}
            className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New newsletter
          </button>
        )}
      </div>

      {editing && (
        <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              {editing.id
                ? editing.status === "sent"
                  ? "Sent newsletter"
                  : "Edit draft"
                : "New newsletter"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-ink/55 hover:underline"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-ink/70">Subject</label>
            <input
              value={editing.subject}
              disabled={editing.status === "sent"}
              onChange={(e) =>
                setEditing({ ...editing, subject: e.target.value })
              }
              placeholder="e.g. October at Kuza Kizazi"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-ink/70">Body</label>
            <div className="mt-1">
              <RichTextEditor
                value={editing.body}
                onChange={(html) =>
                  editing.status === "sent"
                    ? undefined
                    : setEditing({ ...editing, body: html })
                }
                placeholder="Write the newsletter…"
              />
            </div>
            <p className="mt-1 text-xs text-ink/45">
              An unsubscribe link is appended automatically to every copy.
            </p>
          </div>

          <fieldset className="mt-5 rounded-xl border border-ink/10 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
              Audience
            </legend>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-ink/75">
                <input
                  type="radio"
                  name="audienceAll"
                  checked={editing.audienceAll}
                  disabled={editing.status === "sent"}
                  onChange={() =>
                    setEditing({
                      ...editing,
                      audienceAll: true,
                      audienceTags: [],
                    })
                  }
                />
                Everyone{" "}
                <span className="text-ink/45">
                  ({stats?.total ?? "—"} subscribers)
                </span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-ink/75">
                <input
                  type="radio"
                  name="audienceAll"
                  checked={!editing.audienceAll}
                  disabled={editing.status === "sent"}
                  onChange={() =>
                    setEditing({ ...editing, audienceAll: false })
                  }
                />
                Specific tags
              </label>
            </div>
            {!editing.audienceAll && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.length === 0 && (
                  <p className="text-xs text-ink/50">
                    No tagged subscribers yet.
                  </p>
                )}
                {tagOptions.map((t) => {
                  const active = editing.audienceTags.includes(t.tag);
                  return (
                    <button
                      key={t.tag}
                      type="button"
                      disabled={editing.status === "sent"}
                      onClick={() => toggleTag(t.tag)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-ink/15 bg-white text-ink/65 hover:border-brand-300"
                      } ${editing.status === "sent" ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {labelFor(t.tag)}
                      <span className="ml-1 text-ink/45">· {t.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <div className="text-sm text-ink/55">
              {editing.status === "sent" ? (
                <>
                  Sent to <strong>{editing.sentCount}</strong> recipient
                  {editing.sentCount === 1 ? "" : "s"} on{" "}
                  {editing.sentAt && formatDate(editing.sentAt)}
                </>
              ) : (
                <>
                  Audience estimate: <strong>{audienceEstimate}</strong>{" "}
                  subscriber{audienceEstimate === 1 ? "" : "s"}
                </>
              )}
            </div>
            {editing.status !== "sent" && canManage && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || sending || !editing.subject.trim()}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5 disabled:opacity-50"
                >
                  {saving && <Spinner size="sm" />}
                  {editing.id ? "Save draft" : "Create draft"}
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={
                    !editing.id ||
                    sending ||
                    saving ||
                    audienceEstimate === 0 ||
                    !editing.subject.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                  title={
                    !editing.id ? "Save the draft first to enable sending" : ""
                  }
                >
                  {sending && <Spinner size="sm" />}
                  {sending ? "Sending…" : "Send now"}
                </button>
              </div>
            )}
            {editing.status !== "sent" && editing.id > 0 && canManage && (
              <button
                type="button"
                onClick={() => remove(editing)}
                className="text-sm text-red-700 hover:underline"
              >
                Delete draft
              </button>
            )}
          </div>
        </section>
      )}

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={3} columns={4} />
        </div>
      )}
      {!loading && items.length === 0 && !editing && (
        <EmptyState
          className="mt-8"
          icon="📣"
          title="No newsletters yet"
          description="Create your first newsletter campaign. Drafts are saved automatically — you can polish before sending."
          action={
            canManage
              ? { onClick: startNew, label: "+ New newsletter" }
              : undefined
          }
        />
      )}

      {!loading && items.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {items.map((n) => (
                <tr key={n.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">
                    {n.subject || "(untitled)"}
                  </td>
                  <td className="px-4 py-3 text-ink/65">
                    {n.audienceAll
                      ? "Everyone"
                      : n.audienceTags.length === 0
                        ? "—"
                        : n.audienceTags.map(labelFor).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        n.status === "sent"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800"
                      }
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/65">
                    {n.status === "sent"
                      ? `${n.sentCount} on ${n.sentAt ? formatDate(n.sentAt) : ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(n)}
                      className="text-ink/70 hover:underline"
                    >
                      {n.status === "sent" ? "View" : "Edit"}
                    </button>
                    {canManage && n.status !== "sent" && (
                      <button
                        onClick={() => remove(n)}
                        className="ml-4 text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    )}
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
