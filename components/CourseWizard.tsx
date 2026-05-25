"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  adminFetch,
  formatPrice,
  imageUrl,
  type Course,
  type Lesson,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import RichTextEditor from "./RichTextEditor";
import Spinner from "./Spinner";

// One coherent step-driven course builder. The component takes a course
// that already exists in the database (created as a draft by /admin/courses/new)
// and walks the user through Basics → Marketing → Curriculum → Pricing → Publish.
// Every "Save & next" persists the diff, so partial work survives reloads.

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "marketing", label: "Marketing" },
  { key: "curriculum", label: "Curriculum" },
  { key: "pricing", label: "Pricing" },
  { key: "publish", label: "Publish" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES = ["English", "Swahili", "French", "Spanish", "Other"];

interface Props {
  initialCourse: Course;
}

// Course payload sent to the API on each save. Matches the backend's
// courseInput exactly.
function toPayload(c: Course) {
  return {
    title: c.title,
    slug: c.slug,
    summary: c.summary,
    description: c.description,
    coverImage: c.coverImage,
    level: c.level,
    duration: c.duration,
    instructor: c.instructor,
    category: c.category,
    language: c.language,
    promoVideo: c.promoVideo,
    prerequisites: c.prerequisites,
    outcomes: c.outcomes,
    priceCents: c.priceCents,
    status: c.status,
    sortOrder: c.sortOrder,
  };
}

export default function CourseWizard({ initialCourse }: Props) {
  const router = useRouter();
  const [course, setCourse] = useState<Course>(initialCourse);
  const [lessons, setLessons] = useState<Lesson[]>(initialCourse.lessons || []);
  const [step, setStep] = useState<StepKey>("basics");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // Save course meta to the API and update local state.
  const saveCourse = async (patch: Partial<Course> = {}): Promise<boolean> => {
    setSaving(true);
    setError("");
    try {
      const next = { ...course, ...patch };
      const res = await adminFetch(
        `/api/admin/courses/${course.id}`,
        getToken() || "",
        { method: "PUT", body: JSON.stringify(toPayload(next)) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setCourse({ ...data, lessons: undefined });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goto = (key: StepKey) => {
    setError("");
    setStep(key);
  };

  const next = async () => {
    const ok = await saveCourse();
    if (!ok) return;
    const i = STEPS.findIndex((s) => s.key === step);
    if (i < STEPS.length - 1) goto(STEPS[i + 1].key);
  };

  const back = () => {
    const i = STEPS.findIndex((s) => s.key === step);
    if (i > 0) goto(STEPS[i - 1].key);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="text-sm text-ink/50 hover:text-brand-600"
          >
            ← All courses
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {course.title || "Untitled course"}
          </h1>
          <p className="text-sm text-ink/50">
            {course.status === "published" ? "Published" : "Draft"} ·{" "}
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Saved
            </span>
          )}
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/5"
          >
            Preview ↗
          </Link>
        </div>
      </div>

      <StepIndicator current={stepIndex} onJump={(i) => goto(STEPS[i].key)} />

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        {step === "basics" && (
          <BasicsStep course={course} setCourse={setCourse} />
        )}
        {step === "marketing" && (
          <MarketingStep course={course} setCourse={setCourse} />
        )}
        {step === "curriculum" && (
          <CurriculumStep
            course={course}
            lessons={lessons}
            setLessons={setLessons}
          />
        )}
        {step === "pricing" && (
          <PricingStep course={course} setCourse={setCourse} />
        )}
        {step === "publish" && (
          <PublishStep
            course={course}
            lessons={lessons}
            setCourse={setCourse}
            onAfterPublish={() => router.push("/admin/courses")}
            saveCourse={saveCourse}
          />
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
          <button
            type="button"
            disabled={stepIndex === 0 || saving}
            onClick={back}
            className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70 hover:bg-ink/5 disabled:opacity-40"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => saveCourse()}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-ink/5 disabled:opacity-50"
            >
              {saving && <Spinner size="sm" />}
              {saving ? "Saving…" : "Save"}
            </button>
            {step !== "publish" && (
              <button
                type="button"
                disabled={saving || !course.title.trim()}
                onClick={next}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Save &amp; next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step indicator ---

function StepIndicator({
  current,
  onJump,
}: {
  current: number;
  onJump: (i: number) => void;
}) {
  return (
    <ol className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-ink/10 bg-white p-2">
      {STEPS.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={s.key} className="flex-1 min-w-[120px]">
            <button
              type="button"
              onClick={() => onJump(i)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                state === "current"
                  ? "bg-brand-500 text-white"
                  : state === "done"
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "text-ink/55 hover:bg-ink/5"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  state === "current"
                    ? "bg-white/20"
                    : state === "done"
                      ? "bg-brand-500 text-white"
                      : "bg-ink/10"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span className="font-semibold">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// --- Step 1: Basics ---

function BasicsStep({
  course,
  setCourse,
}: {
  course: Course;
  setCourse: (c: Course) => void;
}) {
  const set = <K extends keyof Course>(key: K, value: Course[K]) =>
    setCourse({ ...course, [key]: value });

  return (
    <div>
      <SectionHeader
        eyebrow="Step 1"
        title="Course basics"
        description="The headline information learners see in the catalogue. You can polish this later."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ink/70">
            Course title <span className="text-red-600">*</span>
          </label>
          <input
            required
            value={course.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Brand Identity Fundamentals"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ink/70">
            Short summary
          </label>
          <textarea
            rows={2}
            value={course.summary}
            onChange={(e) => set("summary", e.target.value)}
            placeholder="One or two sentences. This appears under the course title in the catalogue."
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Instructor</label>
          <input
            value={course.instructor}
            onChange={(e) => set("instructor", e.target.value)}
            placeholder="e.g. Sarah Chen"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Level</label>
          <select
            value={course.level}
            onChange={(e) => set("level", e.target.value)}
            className={inputClass}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Category</label>
          <input
            value={course.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="e.g. Branding"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Language</label>
          <select
            value={course.language}
            onChange={(e) => set("language", e.target.value)}
            className={inputClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">
            Estimated duration
          </label>
          <input
            value={course.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="e.g. 3 hours"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Slug</label>
          <input
            value={course.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated from title"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/45">
            Used in the URL: <code>/courses/{course.slug || "your-slug"}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Step 2: Marketing ---

function MarketingStep({
  course,
  setCourse,
}: {
  course: Course;
  setCourse: (c: Course) => void;
}) {
  const set = <K extends keyof Course>(key: K, value: Course[K]) =>
    setCourse({ ...course, [key]: value });

  const [uploading, setUploading] = useState(false);

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
      if (res.ok) set("coverImage", data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Step 2"
        title="Marketing &amp; landing page"
        description="Everything visitors see on the course detail page before they enrol."
      />

      <div className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-ink/70">Cover image</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="aspect-[16/10] w-full max-w-sm overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
              {course.coverImage ? (
                <img
                  src={imageUrl(course.coverImage)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
                  No cover image
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
                className="text-sm"
              />
              {uploading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink/50">
                  <Spinner size="sm" className="text-brand-500" />
                  Uploading…
                </span>
              )}
              {course.coverImage && (
                <button
                  type="button"
                  onClick={() => set("coverImage", "")}
                  className="self-start text-xs text-red-700 hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">
            Promo / trailer video URL
          </label>
          <input
            value={course.promoVideo}
            onChange={(e) => set("promoVideo", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… or a direct .mp4 link"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/45">
            Optional. Shown at the top of the course landing page.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">
            Full description
          </label>
          <div className="mt-1">
            <RichTextEditor
              value={course.description}
              onChange={(html) => set("description", html)}
              placeholder="What is this course about? Who is it for?"
            />
          </div>
        </div>

        <BulletField
          label="What learners will achieve"
          help="One outcome per line. e.g. ‘Design a complete logo system.’"
          value={course.outcomes}
          onChange={(v) => set("outcomes", v)}
        />

        <BulletField
          label="Prerequisites"
          help="One item per line. Leave blank if there are no prerequisites."
          value={course.prerequisites}
          onChange={(v) => set("prerequisites", v)}
        />
      </div>
    </div>
  );
}

function BulletField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const lines = value.split("\n").filter((l) => l.trim() !== "");
  return (
    <div>
      <label className="text-sm font-medium text-ink/70">{label}</label>
      <textarea
        rows={Math.max(3, lines.length + 1)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="Write each item on its own line"
      />
      <p className="mt-1 text-xs text-ink/45">{help}</p>
      {lines.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {lines.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-ink/75"
            >
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Step 3: Curriculum (modules + drag-and-drop lessons) ---

function CurriculumStep({
  course,
  lessons,
  setLessons,
}: {
  course: Course;
  lessons: Lesson[];
  setLessons: (l: Lesson[]) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newModuleInput, setNewModuleInput] = useState("");
  const dragId = useRef<number | null>(null);

  // Group lessons by module name; preserve insertion order of modules.
  const modules = useMemo(() => {
    const order: string[] = [];
    const byModule: Record<string, Lesson[]> = {};
    const sorted = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const l of sorted) {
      const key = l.module || "Untitled section";
      if (!(key in byModule)) {
        byModule[key] = [];
        order.push(key);
      }
      byModule[key].push(l);
    }
    return order.map((m) => ({ name: m, lessons: byModule[m] }));
  }, [lessons]);

  const refresh = async () => {
    const res = await adminFetch(
      `/api/admin/courses/${course.id}`,
      getToken() || "",
    );
    if (res.ok) {
      const data: Course = await res.json();
      setLessons(data.lessons || []);
    }
  };

  const addLesson = async (module: string) => {
    const res = await adminFetch(
      `/api/admin/courses/${course.id}/lessons`,
      getToken() || "",
      {
        method: "POST",
        body: JSON.stringify({
          title: "New lesson",
          module,
          content: "",
          videoUrl: "",
          duration: "",
          isPreview: false,
          sortOrder: lessons.length + 1,
        }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setLessons([...lessons, data]);
      setEditingId(data.id);
    }
  };

  const addModule = async () => {
    const name = newModuleInput.trim();
    if (!name) return;
    setNewModuleInput("");
    await addLesson(name);
  };

  const onDragStart = (id: number) => () => {
    dragId.current = id;
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  // Drop the dragged lesson directly before the target lesson, possibly
  // changing its module to the target's module.
  const onDrop = (targetId: number, targetModule: string) => async () => {
    const draggedId = dragId.current;
    dragId.current = null;
    if (!draggedId || draggedId === targetId) return;

    const ordered = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    const dragged = ordered.find((l) => l.id === draggedId);
    if (!dragged) return;
    const filtered = ordered.filter((l) => l.id !== draggedId);
    const targetIdx = filtered.findIndex((l) => l.id === targetId);
    const insertIdx = targetIdx >= 0 ? targetIdx : filtered.length;
    const movedLesson = { ...dragged, module: targetModule };
    const reordered = [
      ...filtered.slice(0, insertIdx),
      movedLesson,
      ...filtered.slice(insertIdx),
    ];
    const renumbered = reordered.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLessons(renumbered);

    await adminFetch(
      `/api/admin/courses/${course.id}/lessons/reorder`,
      getToken() || "",
      {
        method: "PUT",
        body: JSON.stringify({
          items: renumbered.map((l) => ({
            id: l.id,
            module: l.module,
            sortOrder: l.sortOrder,
          })),
        }),
      },
    );
  };
  // Drop at the end of an (empty) module.
  const onDropOnModule = (moduleName: string) => async () => {
    const draggedId = dragId.current;
    dragId.current = null;
    if (!draggedId) return;
    const ordered = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    const dragged = ordered.find((l) => l.id === draggedId);
    if (!dragged) return;
    const filtered = ordered.filter((l) => l.id !== draggedId);
    const moved = { ...dragged, module: moduleName };
    const reordered = [...filtered, moved];
    const renumbered = reordered.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLessons(renumbered);
    await adminFetch(
      `/api/admin/courses/${course.id}/lessons/reorder`,
      getToken() || "",
      {
        method: "PUT",
        body: JSON.stringify({
          items: renumbered.map((l) => ({
            id: l.id,
            module: l.module,
            sortOrder: l.sortOrder,
          })),
        }),
      },
    );
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Step 3"
        title="Curriculum"
        description="Group lessons into modules. Drag any lesson to reorder it or move it between modules."
      />

      <div className="mt-6 space-y-6">
        {modules.length === 0 ? (
          <EmptyCurriculum
            value={newModuleInput}
            onChange={setNewModuleInput}
            onAdd={addModule}
          />
        ) : (
          modules.map((m) => (
            <ModuleBlock
              key={m.name}
              module={m.name}
              lessons={m.lessons}
              editingId={editingId}
              setEditingId={setEditingId}
              onAddLesson={() => addLesson(m.name)}
              onChangeLesson={(updated) => {
                setLessons(
                  lessons.map((l) => (l.id === updated.id ? updated : l)),
                );
              }}
              onDeleteLesson={async (id) => {
                if (!confirm("Delete this lesson?")) return;
                const res = await adminFetch(
                  `/api/admin/lessons/${id}`,
                  getToken() || "",
                  { method: "DELETE" },
                );
                if (res.ok) setLessons(lessons.filter((l) => l.id !== id));
              }}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDropOnModule={onDropOnModule(m.name)}
              refresh={refresh}
            />
          ))
        )}

        {modules.length > 0 && (
          <div className="rounded-xl border border-dashed border-ink/15 bg-ink/[0.02] p-4">
            <label className="text-sm font-medium text-ink/70">
              Add another module
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={newModuleInput}
                onChange={(e) => setNewModuleInput(e.target.value)}
                placeholder="e.g. Advanced techniques"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addModule}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                + Add module
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyCurriculum({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-ink/[0.02] p-8 text-center">
      <p className="text-sm font-semibold text-ink">No lessons yet</p>
      <p className="mt-1 text-sm text-ink/55">
        Start by adding your first module. You can group lessons under it.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Getting started"
          className="w-72 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Add module
        </button>
      </div>
    </div>
  );
}

function ModuleBlock({
  module,
  lessons,
  editingId,
  setEditingId,
  onAddLesson,
  onChangeLesson,
  onDeleteLesson,
  onDragStart,
  onDragOver,
  onDrop,
  onDropOnModule,
  refresh,
}: {
  module: string;
  lessons: Lesson[];
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  onAddLesson: () => void;
  onChangeLesson: (l: Lesson) => void;
  onDeleteLesson: (id: number) => void;
  onDragStart: (id: number) => () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (
    targetId: number,
    targetModule: string,
  ) => () => void | Promise<void>;
  onDropOnModule: () => void | Promise<void>;
  refresh: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-ink/[0.015]">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">{module}</h3>
        <button
          type="button"
          onClick={onAddLesson}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          + Add lesson
        </button>
      </div>
      <ul
        className="divide-y divide-ink/[0.06]"
        onDragOver={onDragOver}
        onDrop={onDropOnModule}
      >
        {lessons.map((l, i) => (
          <li
            key={l.id}
            draggable
            onDragStart={onDragStart(l.id)}
            onDragOver={onDragOver}
            onDrop={onDrop(l.id, module)}
            className="bg-white"
          >
            {editingId === l.id ? (
              <LessonEditor
                lesson={l}
                onSaved={(updated) => {
                  onChangeLesson(updated);
                  setEditingId(null);
                  refresh();
                }}
                onCancel={() => setEditingId(null)}
                onDelete={() => onDeleteLesson(l.id)}
              />
            ) : (
              <LessonRow
                index={i + 1}
                lesson={l}
                onEdit={() => setEditingId(l.id)}
                onDelete={() => onDeleteLesson(l.id)}
              />
            )}
          </li>
        ))}
        {lessons.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-ink/50">
            Drop a lesson here, or click “Add lesson” above.
          </li>
        )}
      </ul>
    </div>
  );
}

function LessonRow({
  index,
  lesson,
  onEdit,
  onDelete,
}: {
  index: number;
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="cursor-grab text-ink/40 select-none">⋮⋮</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-xs font-semibold text-ink/55">
          {index}
        </span>
        <div>
          <p className="text-sm font-medium text-ink">
            {lesson.title}
            {lesson.isPreview && (
              <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Free preview
              </span>
            )}
          </p>
          <p className="text-xs text-ink/45">
            {[lesson.duration, lesson.videoUrl ? "Has video" : null]
              .filter(Boolean)
              .join(" · ") || "No metadata yet"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <button
          onClick={onEdit}
          className="text-ink/70 hover:text-brand-600 hover:underline"
        >
          Edit
        </button>
        <button onClick={onDelete} className="text-red-700 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

function LessonEditor({
  lesson,
  onSaved,
  onCancel,
  onDelete,
}: {
  lesson: Lesson;
  onSaved: (l: Lesson) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Lesson>(lesson);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = <K extends keyof Lesson>(key: K, v: Lesson[K]) =>
    setDraft({ ...draft, [key]: v });

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await adminFetch(
        `/api/admin/lessons/${lesson.id}`,
        getToken() || "",
        {
          method: "PUT",
          body: JSON.stringify({
            title: draft.title,
            module: draft.module,
            slug: draft.slug,
            content: draft.content,
            videoUrl: draft.videoUrl,
            duration: draft.duration,
            isPreview: draft.isPreview,
            sortOrder: draft.sortOrder,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 bg-brand-50/40 px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Title
          </label>
          <input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Duration
          </label>
          <input
            value={draft.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="e.g. 8 min"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Video URL
          </label>
          <input
            value={draft.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… or .mp4 link"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Lesson content
          </label>
          <div className="mt-1">
            <RichTextEditor
              value={draft.content}
              onChange={(html) => set("content", html)}
              placeholder="Write the lesson…"
            />
          </div>
        </div>
        <label className="sm:col-span-3 flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={draft.isPreview}
            onChange={(e) => set("isPreview", e.target.checked)}
          />
          Allow as free preview (visible to non-buyers)
        </label>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-red-700 hover:underline"
        >
          Delete lesson
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/65 hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving && <Spinner size="sm" />}
            {saving ? "Saving…" : "Save lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Step 4: Pricing ---

function PricingStep({
  course,
  setCourse,
}: {
  course: Course;
  setCourse: (c: Course) => void;
}) {
  const [priceInput, setPriceInput] = useState(String(course.priceCents / 100));
  useEffect(() => {
    setPriceInput(String(course.priceCents / 100));
  }, [course.priceCents]);

  return (
    <div>
      <SectionHeader
        eyebrow="Step 4"
        title="Pricing &amp; access"
        description="Set a one-time purchase price. Free courses (price 0) are always accessible. Active members get every course included regardless of price."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink/70">
            Price (KSh)
          </label>
          <input
            type="number"
            min="0"
            step="50"
            value={priceInput}
            onChange={(e) => {
              setPriceInput(e.target.value);
              setCourse({
                ...course,
                priceCents: Math.round(Number(e.target.value || 0) * 100),
              });
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/45">
            Set to <strong>0</strong> to make the course completely free for
            everyone.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">
            Catalogue sort order
          </label>
          <input
            type="number"
            value={course.sortOrder}
            onChange={(e) =>
              setCourse({ ...course, sortOrder: Number(e.target.value || 0) })
            }
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/45">
            Lower numbers appear first in the courses list.
          </p>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-sm text-ink/75">
          <p className="font-semibold text-ink">How access works</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Free courses</strong> (price = 0): open to everyone.
            </li>
            <li>
              <strong>Paid courses</strong>: locked behind one-time purchase{" "}
              <span className="text-ink/55">
                (current price: {formatPrice(course.priceCents)})
              </span>
              .
            </li>
            <li>
              <strong>Members</strong> always have access to every course.
            </li>
            <li>
              Any lessons you marked “Free preview” are visible to non-buyers
              as a sample.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Step 5: Publish ---

function PublishStep({
  course,
  lessons,
  setCourse,
  saveCourse,
  onAfterPublish,
}: {
  course: Course;
  lessons: Lesson[];
  setCourse: (c: Course) => void;
  saveCourse: (patch?: Partial<Course>) => Promise<boolean>;
  onAfterPublish: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const issues: string[] = [];
  if (!course.title.trim()) issues.push("Add a course title (Basics step).");
  if (!course.summary.trim())
    issues.push("Add a short summary (Basics step).");
  if (!course.coverImage)
    issues.push("Upload a cover image (Marketing step).");
  if (lessons.length === 0)
    issues.push("Add at least one lesson (Curriculum step).");

  const publish = async () => {
    setPublishing(true);
    const ok = await saveCourse({ status: "published" });
    setPublishing(false);
    if (ok) {
      setCourse({ ...course, status: "published" });
      onAfterPublish();
    }
  };

  const unpublish = async () => {
    setPublishing(true);
    const ok = await saveCourse({ status: "draft" });
    setPublishing(false);
    if (ok) setCourse({ ...course, status: "draft" });
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Step 5"
        title="Review &amp; publish"
        description="Make sure everything looks right. You can come back and edit any of this later."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-ink/10 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            At a glance
          </h3>
          <dl className="mt-4 grid gap-2 text-sm">
            <Row label="Title" value={course.title || "—"} />
            <Row label="Instructor" value={course.instructor || "—"} />
            <Row label="Level" value={course.level} />
            <Row label="Category" value={course.category || "—"} />
            <Row label="Language" value={course.language} />
            <Row label="Duration" value={course.duration || "—"} />
            <Row label="Price" value={formatPrice(course.priceCents)} />
            <Row label="Lessons" value={String(lessons.length)} />
            <Row
              label="Free preview lessons"
              value={String(lessons.filter((l) => l.isPreview).length)}
            />
          </dl>
        </div>

        <div className="space-y-4">
          {issues.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Before publishing
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                {issues.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              ✓ Everything looks ready. Hit publish to make this course live.
            </div>
          )}

          {course.status === "published" ? (
            <div className="rounded-xl border border-ink/10 p-4">
              <p className="text-sm font-semibold text-ink">
                Currently published
              </p>
              <p className="mt-1 text-xs text-ink/55">
                The course is live at{" "}
                <code>/courses/{course.slug}</code>.
              </p>
              <button
                type="button"
                disabled={publishing}
                onClick={unpublish}
                className="mt-3 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
              >
                Unpublish (back to draft)
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={publishing || issues.length > 0}
              onClick={publish}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {publishing && <Spinner size="sm" />}
              {publishing ? "Publishing…" : "Publish course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink/[0.06] py-1 last:border-0">
      <dt className="text-ink/55">{label}</dt>
      <dd className="text-right font-medium text-ink/85">{value}</dd>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-ink/55">{description}</p>
    </div>
  );
}
