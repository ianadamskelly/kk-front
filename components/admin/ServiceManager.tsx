"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, type Service, type ServicePillar, type ServiceSubservice } from "@/lib/api";
import { getToken } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import StatusToggle from "@/components/StatusToggle";
import Spinner, { LoadingBlock } from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500";

const PILLARS: { value: ServicePillar; label: string }[] = [
  { value: "", label: "No pillar (draft only)" },
  { value: "brand_identity", label: "Brand Identity" },
  { value: "digital_platforms", label: "Websites & Digital Platforms" },
  { value: "content_growth", label: "Content, Media & Growth" },
];

interface ServiceForm {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  pillar: ServicePillar;
  sortOrder: number;
  status: "draft" | "published";
}

interface SubserviceForm {
  id?: number;
  title: string;
  summary: string;
  body: string;
  sortOrder: number;
  status: "draft" | "published";
}

const EMPTY_SERVICE: ServiceForm = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  icon: "",
  pillar: "brand_identity",
  sortOrder: 0,
  status: "draft",
};

const EMPTY_SUBSERVICE: SubserviceForm = {
  title: "",
  summary: "",
  body: "",
  sortOrder: 0,
  status: "published",
};

function serviceForm(service: Service): ServiceForm {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    summary: service.summary,
    body: service.body,
    icon: service.icon,
    pillar: service.pillar,
    sortOrder: service.sortOrder,
    status: service.status,
  };
}

function subserviceForm(item: ServiceSubservice): SubserviceForm {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    body: item.body,
    sortOrder: item.sortOrder,
    status: item.status,
  };
}

function statusBadge(status: string) {
  return status === "published"
    ? "bg-green-100 text-green-800"
    : "bg-amber-100 text-amber-800";
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ServiceForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<Service | null>(null);
  const [subservices, setSubservices] = useState<ServiceSubservice[]>([]);
  const [loadingSubservices, setLoadingSubservices] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState<SubserviceForm | null>(null);
  const [savingSubservice, setSavingSubservice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/services", getToken() || "");
      if (!res.ok) throw new Error("Failed to load services");
      const items = (await res.json()) as Service[];
      setServices(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCapabilities = async (service: Service) => {
    setActive(service);
    setEditingSubservice(null);
    setLoadingSubservices(true);
    setError("");
    try {
      const res = await adminFetch(
        `/api/admin/services/${service.id}/subservices`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load capabilities");
      setSubservices((await res.json()) as ServiceSubservice[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoadingSubservices(false);
    }
  };

  const saveService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const res = await adminFetch(
        editing.id ? `/api/admin/services/${editing.id}` : "/api/admin/services",
        getToken() || "",
        {
          method: editing.id ? "PUT" : "POST",
          body: JSON.stringify(editing),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (active?.id === data.id) {
        setActive(data as Service);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (service: Service) => {
    if (!confirm(`Delete ${service.title}? Its capabilities will also be removed.`)) return;
    const res = await adminFetch(`/api/admin/services/${service.id}`, getToken() || "", {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Could not delete service.");
      return;
    }
    if (active?.id === service.id) {
      setActive(null);
      setSubservices([]);
    }
    await load();
  };

  const saveSubservice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!active || !editingSubservice) return;
    setSavingSubservice(true);
    setError("");
    try {
      const suffix = editingSubservice.id ? `/${editingSubservice.id}` : "";
      const res = await adminFetch(
        `/api/admin/services/${active.id}/subservices${suffix}`,
        getToken() || "",
        {
          method: editingSubservice.id ? "PUT" : "POST",
          body: JSON.stringify(editingSubservice),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setEditingSubservice(null);
      await openCapabilities(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save error");
    } finally {
      setSavingSubservice(false);
    }
  };

  const removeSubservice = async (subservice: ServiceSubservice) => {
    if (!active || !confirm(`Delete ${subservice.title}?`)) return;
    const res = await adminFetch(
      `/api/admin/services/${active.id}/subservices/${subservice.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Could not delete capability.");
      return;
    }
    await openCapabilities(active);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Services</h1>
          <p className="text-sm text-ink/50">
            Manage public service pillars and the capabilities displayed within each service page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_SERVICE })}
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New service
        </button>
      </div>

      {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {editing && (
        <form onSubmit={saveService} className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            {editing.id ? "Edit service" : "Create service"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink/70">
              Title
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-sm font-medium text-ink/70">
              Pillar
              <select
                value={editing.pillar}
                onChange={(e) =>
                  setEditing({ ...editing, pillar: e.target.value as ServicePillar })
                }
                className={`mt-1 ${inputClass}`}
              >
                {PILLARS.map((pillar) => (
                  <option key={pillar.value} value={pillar.value}>
                    {pillar.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ink/70">
              Icon
              <input
                value={editing.icon}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-sm font-medium text-ink/70">
              Sort order
              <input
                type="number"
                value={editing.sortOrder}
                onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-sm font-medium text-ink/70 sm:col-span-2">
              Summary
              <textarea
                rows={3}
                value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-ink/70">Description</p>
              <div className="mt-1">
                <RichTextEditor
                  value={editing.body}
                  onChange={(body) => setEditing({ ...editing, body })}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-ink/70">Status</p>
              <div className="mt-1">
                <StatusToggle
                  value={editing.status}
                  onChange={(status) => setEditing({ ...editing, status })}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving && <Spinner size="sm" />}
              {saving ? "Saving..." : "Save service"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingBlock label="Loading services..." />
        </div>
      ) : (
        <div className="mt-7 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-wrap items-center gap-4 border-b border-ink/10 px-5 py-4 last:border-b-0"
            >
              <div className="min-w-52 flex-1">
                <p className="font-semibold text-ink">{service.title}</p>
                <p className="text-xs text-ink/50">
                  {PILLARS.find((pillar) => pillar.value === service.pillar)?.label ||
                    "No public pillar"}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(service.status)}`}>
                {service.status}
              </span>
              <button
                type="button"
                onClick={() => openCapabilities(service)}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                Capabilities
              </button>
              <button
                type="button"
                onClick={() => setEditing(serviceForm(service))}
                className="text-sm text-ink/65 hover:text-ink"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeService(service)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <section className="mt-10 rounded-2xl border border-ink/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
                Capabilities
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">{active.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setEditingSubservice({ ...EMPTY_SUBSERVICE })}
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              + New capability
            </button>
          </div>

          {editingSubservice && (
            <form onSubmit={saveSubservice} className="mt-6 rounded-xl border border-ink/10 bg-cream p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink/70">
                  Title
                  <input
                    required
                    value={editingSubservice.title}
                    onChange={(e) =>
                      setEditingSubservice({ ...editingSubservice, title: e.target.value })
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm font-medium text-ink/70">
                  Sort order
                  <input
                    type="number"
                    value={editingSubservice.sortOrder}
                    onChange={(e) =>
                      setEditingSubservice({
                        ...editingSubservice,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm font-medium text-ink/70 sm:col-span-2">
                  Summary
                  <textarea
                    rows={2}
                    value={editingSubservice.summary}
                    onChange={(e) =>
                      setEditingSubservice({ ...editingSubservice, summary: e.target.value })
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-ink/70">Detail</p>
                  <div className="mt-1">
                    <RichTextEditor
                      value={editingSubservice.body}
                      onChange={(body) =>
                        setEditingSubservice({ ...editingSubservice, body })
                      }
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <StatusToggle
                    value={editingSubservice.status}
                    onChange={(status) =>
                      setEditingSubservice({ ...editingSubservice, status })
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={savingSubservice}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingSubservice && <Spinner size="sm" />}
                  {savingSubservice ? "Saving..." : "Save capability"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubservice(null)}
                  className="rounded-full border border-ink/15 px-5 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingSubservices ? (
            <div className="mt-6">
              <LoadingBlock label="Loading capabilities..." />
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {subservices.map((subservice) => (
                <div
                  key={subservice.id}
                  className="flex flex-wrap items-start gap-4 rounded-xl border border-ink/10 p-4"
                >
                  <div className="min-w-56 flex-1">
                    <p className="font-semibold text-ink">{subservice.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{subservice.summary}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(subservice.status)}`}>
                    {subservice.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingSubservice(subserviceForm(subservice))}
                    className="text-sm text-ink/65"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSubservice(subservice)}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {subservices.length === 0 && (
                <p className="rounded-xl bg-ink/[0.03] p-5 text-sm text-ink/55">
                  No capabilities yet. Add the concrete ways this service helps clients.
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
