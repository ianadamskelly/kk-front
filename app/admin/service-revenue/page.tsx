"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  fetchServices,
  formatPrice,
  type Service,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { LoadingBlock } from "@/components/Spinner";

interface ServiceRevenueRow {
  id: number;
  serviceId: number | null;
  serviceName: string;
  clientName: string;
  amountCents: number;
  currency: string;
  occurredAt: string;
  note: string;
  createdAt: string;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminServiceRevenuePage() {
  const [rows, setRows] = useState<ServiceRevenueRow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    serviceId: "",
    serviceName: "",
    clientName: "",
    amount: "",
    currency: "KES",
    occurredAt: todayISO(),
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, svc] = await Promise.all([
        adminFetch("/api/admin/service-revenue", getToken() || ""),
        fetchServices(),
      ]);
      if (!revRes.ok) throw new Error("Failed to load entries");
      setRows((await revRes.json()) || []);
      setServices(svc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const cents = Math.round(parseFloat(form.amount || "0") * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setSubmitting(false);
      setError("Amount must be greater than zero");
      return;
    }
    const serviceId = form.serviceId ? Number(form.serviceId) : null;
    const chosen = services.find((s) => s.id === serviceId);
    const body = {
      serviceId,
      serviceName: form.serviceName.trim() || chosen?.title || "",
      clientName: form.clientName.trim(),
      amountCents: cents,
      currency: form.currency,
      occurredAt: form.occurredAt,
      note: form.note.trim(),
    };
    try {
      const res = await adminFetch(
        "/api/admin/service-revenue",
        getToken() || "",
        { method: "POST", body: JSON.stringify(body) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save entry");
      setRows((list) => [data, ...list]);
      setForm({
        serviceId: "",
        serviceName: "",
        clientName: "",
        amount: "",
        currency: form.currency,
        occurredAt: todayISO(),
        note: "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (row: ServiceRevenueRow) => {
    if (!confirm(`Delete this entry?`)) return;
    const res = await adminFetch(
      `/api/admin/service-revenue/${row.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setRows((list) => list.filter((r) => r.id !== row.id));
  };

  const total = rows.reduce((sum, r) => sum + r.amountCents, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Service income
      </h1>
      <p className="text-sm text-ink/50">
        Manually log income from consulting and service work that&apos;s
        invoiced offline. Totals feed the dashboard&apos;s services bucket.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-ink/10 bg-white p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Log an entry
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink/70">Service</label>
            <select
              value={form.serviceId}
              onChange={(e) =>
                setForm((f) => ({ ...f, serviceId: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">— Other / unlisted —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Service name (if unlisted)
            </label>
            <input
              value={form.serviceName}
              onChange={(e) =>
                setForm((f) => ({ ...f, serviceName: e.target.value }))
              }
              className={inputClass}
              placeholder="e.g. Brand audit"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Client</label>
            <input
              required
              value={form.clientName}
              onChange={(e) =>
                setForm((f) => ({ ...f, clientName: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Date received
            </label>
            <input
              type="date"
              required
              value={form.occurredAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, occurredAt: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Amount (major units, e.g. 1500.00)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Currency</label>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value }))
              }
              className={inputClass}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink/70">
              Note (optional)
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Add entry"}
        </button>
      </form>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/45">
          Entries
        </h2>
        <p className="text-sm text-ink/55">
          Total logged:{" "}
          <span className="font-semibold text-ink">{formatPrice(total)}</span>
        </p>
      </div>

      {loading && <LoadingBlock label="Loading entries…" />}
      {!loading && rows.length === 0 && (
        <EmptyState
          className="mt-4"
          icon="🧾"
          title="No entries yet"
          description="Log your first manual service-revenue entry above. They'll show up here and in the revenue overview."
        />
      )}

      {rows.length > 0 && (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {r.serviceName || "Service"} · {r.clientName || "—"}
                </p>
                <p className="text-xs text-ink/55">
                  {r.occurredAt.slice(0, 10)}
                </p>
                {r.note && (
                  <p className="mt-1 text-sm text-ink/65">{r.note}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-semibold text-ink">
                  {r.currency === "KES"
                    ? formatPrice(r.amountCents)
                    : `$${(r.amountCents / 100).toFixed(2)}`}
                </span>
                <button
                  onClick={() => remove(r)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
