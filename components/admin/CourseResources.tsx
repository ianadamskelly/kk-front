"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, type CourseResource } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Spinner from "@/components/Spinner";

interface Props {
  courseId: number;
  /** Pass a lesson id to manage that lesson's resources; omit for course-wide. */
  lessonId?: number;
}

// CourseResources is the admin manager for either course-wide or
// lesson-specific resources. Backed by /api/admin/courses/{id}/resources
// (filtered on the client by lessonId for lesson-scoped views).
export default function CourseResources({ courseId, lessonId }: Props) {
  const [items, setItems] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/courses/${courseId}/resources`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load resources");
      const all = ((await res.json()) || []) as CourseResource[];
      const scoped = lessonId
        ? all.filter((r) => r.lessonId === lessonId)
        : all.filter((r) => r.lessonId == null);
      setItems(scoped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await adminFetch("/api/admin/upload-file", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");
      setUrl(upData.url);
      if (!label) setLabel(upData.filename || file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const add = async () => {
    setError("");
    if (!label.trim() || !url.trim()) {
      setError("Label and URL are required");
      return;
    }
    const res = await adminFetch(
      `/api/admin/courses/${courseId}/resources`,
      getToken() || "",
      {
        method: "POST",
        body: JSON.stringify({
          lessonId: lessonId ?? null,
          label: label.trim(),
          url: url.trim(),
          kind: url.startsWith("http") ? "link" : "file",
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add resource");
      return;
    }
    setItems((list) => [...list, data]);
    setLabel("");
    setUrl("");
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this resource?")) return;
    const res = await adminFetch(
      `/api/admin/courses/${courseId}/resources/${id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Could not delete resource");
      return;
    }
    setItems((list) => list.filter((r) => r.id !== id));
  };

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">
        {lessonId ? "Lesson resources" : "Course-wide resources"}
      </p>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-ink/55">
          <Spinner size="sm" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink/45">No resources yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/[0.06]">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate text-ink">
                <span className="mr-1">{r.kind === "file" ? "📎" : "🔗"}</span>
                {r.label}
              </span>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline"
              >
                Open
              </a>
              <button
                onClick={() => remove(r.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-ink/10 pt-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Project starter files)"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/resource"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-ink/70 hover:border-brand-400 hover:text-ink">
            <span>{uploading ? "Uploading…" : "📎 Upload a file"}</span>
            <input
              type="file"
              accept=".pdf,.zip,.epub,.mobi,.docx,.xlsx,.pptx,.txt,.csv,.mp3,.mp4,.m4a,.wav"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          <button
            type="button"
            onClick={add}
            className="ml-auto rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
