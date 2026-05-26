"use client";

import { useState } from "react";
import {
  API_URL,
  resolveFileURL,
  type CourseTask,
  type CourseTaskSubmission,
} from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import Spinner from "@/components/Spinner";

interface Props {
  task: CourseTask;
  /** Pre-loaded submission (may not exist on first view). */
  existing?: CourseTaskSubmission;
  onSaved?: (sub: CourseTaskSubmission) => void;
}

// ModuleTask renders the task prompt + the student's submission form.
// Shown at the end of the last lesson of a module by LessonView.
export default function ModuleTask({ task, existing, onSaved }: Props) {
  const { token } = useCustomer();
  const [body, setBody] = useState(existing?.body || "");
  // fileUrl is the raw stored value we POST back on submit; fileViewUrl
  // is the browser-fetchable URL (signed token or external link) used
  // for the "View attachment" anchor.
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl || "");
  const [fileViewUrl, setFileViewUrl] = useState(
    existing ? resolveFileURL(existing.fileUrl) : "",
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<CourseTaskSubmission | undefined>(existing);

  const onUpload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Customer-side endpoint (not the admin one). Stores the file
      // in the protected uploads dir; reads are gated through
      // /api/files/{token} when the response comes back.
      const up = await fetch(`${API_URL}/api/account/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");
      setFileUrl(upData.url);
      // The server hands back a signed view URL for protected uploads
      // so the student can preview the attachment immediately.
      setFileViewUrl(resolveFileURL(upData.viewUrl || upData.url));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!body.trim() && !fileUrl) {
      setError("Write something or attach a file.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/account/tasks/${task.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body, fileUrl }),
        },
      );
      const data = (await res.json()) as CourseTaskSubmission;
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Could not submit");
      setCurrent(data);
      onSaved?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink/60">
        Sign in to submit your response to this task.
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        End of module · Task
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/85">{task.prompt}</p>
      {task.requiredPass && (
        <p className="mt-2 text-xs text-ink/55">
          A passing grade on this task is required to complete the course.
        </p>
      )}

      {current?.grade === "passed" && (
        <p className="mt-3 rounded-md bg-green-100 px-3 py-2 text-sm text-green-900">
          ✓ You passed this task.
          {current.feedback && (
            <span className="mt-1 block whitespace-pre-wrap text-xs">{current.feedback}</span>
          )}
        </p>
      )}
      {current?.grade === "failed" && (
        <p className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-900">
          Your submission wasn&apos;t accepted — revise and resubmit.
          {current.feedback && (
            <span className="mt-1 block whitespace-pre-wrap text-xs">{current.feedback}</span>
          )}
        </p>
      )}
      {current && current.grade === "" && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Your submission is awaiting review.
        </p>
      )}

      <div className="mt-4 space-y-3">
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your response…"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-ink/70 hover:border-brand-400 hover:text-ink">
            <span>
              {uploading
                ? "Uploading…"
                : fileUrl
                  ? "📎 Replace file"
                  : "📎 Attach a file (optional)"}
            </span>
            <input
              type="file"
              accept=".pdf,.zip,.epub,.mobi,.docx,.xlsx,.pptx,.txt,.csv,.mp3,.mp4,.m4a,.wav,.png,.jpg,.jpeg"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          {fileUrl && fileViewUrl && (
            <a
              href={fileViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink/60 hover:text-brand-600"
            >
              View attachment
            </a>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting && <Spinner size="sm" />}
            {submitting
              ? "Submitting…"
              : current
                ? "Resubmit"
                : "Submit response"}
          </button>
        </div>
      </div>
    </form>
  );
}
