"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatPrice } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAdminSession } from "@/lib/adminSession";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: "percent" | "amount";
  percentOff: number;
  amountOffCents: number;
  scope: "all" | "shop" | "courses" | "memberships";
  minSubtotalCents: number;
  maxUses: number | null;
  perUserMaxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const EMPTY = {
  code: "",
  description: "",
  discountType: "percent" as "percent" | "amount",
  percentOff: "10",
  amountOff: "0", // KES major-units
  scope: "all" as Coupon["scope"],
  minSubtotal: "0", // KES major-units
  maxUses: "",
  perUserMaxUses: "",
  startsAt: "",
  expiresAt: "",
  active: true,
};

const SCOPE_LABELS: Record<Coupon["scope"], string> = {
  all: "Everything",
  shop: "Shop only",
  courses: "Courses only",
  memberships: "Memberships only",
};

// Convert an RFC3339 timestamp to the local <input type="datetime-local"> format.
function toLocalDT(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}
function fromLocalDT(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

export default function AdminCouponsPage() {
  const { can } = useAdminSession();
  const canManage = can("coupons.manage");

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/coupons", getToken() || "");
      if (!res.ok) throw new Error("Failed to load coupons");
      setCoupons((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      percentOff: String(c.percentOff || 10),
      amountOff: String(c.amountOffCents / 100 || 0),
      scope: c.scope,
      minSubtotal: String(c.minSubtotalCents / 100),
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      perUserMaxUses: c.perUserMaxUses != null ? String(c.perUserMaxUses) : "",
      startsAt: toLocalDT(c.startsAt),
      expiresAt: toLocalDT(c.expiresAt),
      active: c.active,
    });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        percentOff:
          form.discountType === "percent" ? Number(form.percentOff || 0) : 0,
        amountOffCents:
          form.discountType === "amount"
            ? Math.round(Number(form.amountOff || 0) * 100)
            : 0,
        scope: form.scope,
        minSubtotalCents: Math.round(Number(form.minSubtotal || 0) * 100),
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        perUserMaxUses:
          form.perUserMaxUses === "" ? null : Number(form.perUserMaxUses),
        startsAt: fromLocalDT(form.startsAt),
        expiresAt: fromLocalDT(form.expiresAt),
        active: form.active,
      };
      const res = await adminFetch(
        editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons",
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

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"? Past redemptions are kept in order history.`))
      return;
    const res = await adminFetch(
      `/api/admin/coupons/${c.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setCoupons((list) => list.filter((x) => x.id !== c.id));
    else alert("Could not delete.");
  };

  const renderDiscount = (c: Coupon) =>
    c.discountType === "percent"
      ? `${c.percentOff}% off`
      : `${formatPrice(c.amountOffCents)} off`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Coupons
          </h1>
          <p className="text-sm text-ink/50">
            Discount codes customers can apply at checkout. Choose a scope to
            target shop, courses, memberships — or everything.
          </p>
        </div>
        {canManage && (
          <button
            onClick={startNew}
            className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New coupon
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            {editingId ? "Edit coupon" : "New coupon"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink/70">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="WELCOME10"
                className={inputClass + " uppercase"}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Scope</label>
              <select
                value={form.scope}
                onChange={(e) =>
                  setForm({ ...form, scope: e.target.value as Coupon["scope"] })
                }
                className={inputClass}
              >
                <option value="all">Everything</option>
                <option value="shop">Shop only</option>
                <option value="courses">Courses only</option>
                <option value="memberships">Memberships only</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink/70">
                Description (admin-only)
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. Launch promotion, valid October"
                className={inputClass}
              />
            </div>

            <fieldset className="sm:col-span-2 rounded-xl border border-ink/10 p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                Discount
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-ink/75">
                  <input
                    type="radio"
                    name="discountType"
                    checked={form.discountType === "percent"}
                    onChange={() =>
                      setForm({ ...form, discountType: "percent" })
                    }
                  />
                  Percent off
                </label>
                <label className="flex items-center gap-2 text-sm text-ink/75">
                  <input
                    type="radio"
                    name="discountType"
                    checked={form.discountType === "amount"}
                    onChange={() => setForm({ ...form, discountType: "amount" })}
                  />
                  Fixed amount off
                </label>
                {form.discountType === "percent" ? (
                  <div>
                    <label className="text-xs font-medium text-ink/60">
                      Percent (1-100)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.percentOff}
                      onChange={(e) =>
                        setForm({ ...form, percentOff: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-ink/60">
                      Amount (KSh)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.amountOff}
                      onChange={(e) =>
                        setForm({ ...form, amountOff: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </fieldset>

            <div>
              <label className="text-sm font-medium text-ink/70">
                Minimum subtotal (KSh)
              </label>
              <input
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={(e) =>
                  setForm({ ...form, minSubtotal: e.target.value })
                }
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ink/45">
                Optional. 0 = no minimum.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Max total uses
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) =>
                  setForm({ ...form, maxUses: e.target.value })
                }
                placeholder="Unlimited"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Max uses per customer
              </label>
              <input
                type="number"
                min={1}
                value={form.perUserMaxUses}
                onChange={(e) =>
                  setForm({ ...form, perUserMaxUses: e.target.value })
                }
                placeholder="Unlimited"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Valid from
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm({ ...form, startsAt: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">
                Expires at
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-ink/75">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              Active (customers can use this code right now)
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update coupon" : "Create coupon"}
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
          <SkeletonTableRows rows={3} columns={canManage ? 6 : 5} />
        </div>
      )}
      {!loading && coupons.length === 0 && !showForm && (
        <EmptyState
          className="mt-8"
          icon="🎟️"
          title="No coupons yet"
          description="Create a code customers can enter at checkout for a discount."
          action={
            canManage
              ? { onClick: startNew, label: "+ New coupon" }
              : undefined
          }
        />
      )}

      {!loading && coupons.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {coupons.map((c) => {
                const expired =
                  c.expiresAt && new Date(c.expiresAt) < new Date();
                const maxed = c.maxUses != null && c.usedCount >= c.maxUses;
                const statusLabel = !c.active
                  ? "Disabled"
                  : expired
                    ? "Expired"
                    : maxed
                      ? "Fully used"
                      : "Active";
                const statusTone =
                  statusLabel === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-ink/10 text-ink/55";
                return (
                  <tr key={c.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-ink">
                      {c.code}
                      {c.description && (
                        <p className="mt-0.5 font-sans text-xs font-normal text-ink/50">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/75">{renderDiscount(c)}</td>
                    <td className="px-4 py-3 text-ink/65">
                      {SCOPE_LABELS[c.scope]}
                    </td>
                    <td className="px-4 py-3 text-ink/65">
                      {c.usedCount}
                      {c.maxUses != null && ` / ${c.maxUses}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusTone}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-ink/70 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="ml-4 text-red-700 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
