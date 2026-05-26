"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, type CourseTask } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Spinner from "@/components/Spinner";

interface Props {
  courseId: number;
  /** Known module names to suggest in the new-task module dropdown. */
  knownModules?: string[];
}

// CourseTasks is the admin editor for the end-of-module tasks
// attached to a course. Mounted inside CourseWizard near the
// curriculum so authoring stays in one place.
export default function CourseTasks({ courseId, knownModules = [] }: Props) {
  const [items, setItems] = useState<CourseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New-task form state.
  const [module, setModule] = useState(knownModules[0] || "");
  const [prompt, setPrompt] = useState("");
  const [requiredPass, setRequiredPass] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/courses/${courseId}/tasks`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load tasks");
      setItems((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    setError("");
    if (!module.trim() || !prompt.trim()) {
      setError("Module and prompt are required");
      return;
    }
    const res = await adminFetch(
      `/api/admin/courses/${courseId}/tasks`,
      getToken() || "",
      {
        method: "POST",
        body: JSON.stringify({ module: module.trim(), prompt: prompt.trim(), requiredPass }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add task");
      return;
    }
    setItems((list) => [...list, data]);
    setPrompt("");
    setRequiredPass(false);
  };

  const update = async (t: CourseTask) => {
    const res = await adminFetch(
      `/api/admin/courses/${courseId}/tasks/${t.id}`,
      getToken() || "",
      {
        method: "PUT",
        body: JSON.stringify({
          module: t.module,
          prompt: t.prompt,
          requiredPass: t.requiredPass,
        }),
      },
    );
    if (!res.ok) setError("Could not update task");
    else load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this task and all of its submissions?")) return;
    const res = await adminFetch(
      `/api/admin/courses/${courseId}/tasks/${id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) setError("Could not delete task");
    else setItems((list) => list.filter((x) => x.id !== id));
  };

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">
            Module tasks
          </p>
          <p className="text-xs text-ink/55">
            Each task shows at the end of the last lesson in its module.
            Students submit a written response (and optional file); you
            grade pass/fail with feedback.
          </p>
        </div>
        <a
          href={`/admin/courses/${courseId}/submissions`}
          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/70 hover:border-brand-400 hover:text-ink"
        >
          Open submissions inbox →
        </a>
      </div>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-ink/55">
          <Spinner size="sm" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink/45">No tasks yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((t) => (
            <li key={t.id} className="rounded-lg border border-ink/[0.08] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
                <span>Module: <strong className="text-ink/80">{t.module}</strong></span>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={t.requiredPass}
                    onChange={(e) =>
                      update({ ...t, requiredPass: e.target.checked })
                    }
                  />
                  Required to pass
                </label>
              </div>
              <textarea
                rows={2}
                value={t.prompt}
                onChange={(e) =>
                  setItems((list) =>
                    list.map((x) => (x.id === t.id ? { ...x, prompt: e.target.value } : x)),
                  )
                }
                onBlur={() => update(t)}
                className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-ink/10 pt-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            list="kk-modules-list"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            placeholder="Module name (matches a lesson group)"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <datalist id="kk-modules-list">
            {knownModules.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <label className="inline-flex items-center gap-1.5 px-1 text-xs text-ink/65">
            <input
              type="checkbox"
              checked={requiredPass}
              onChange={(e) => setRequiredPass(e.target.checked)}
            />
            Required to pass
          </label>
        </div>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Task prompt — what should the student do?"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={add}
            className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Add task
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
