"use client";

import { useEffect, useState } from "react";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import Spinner, { LoadingBlock } from "@/components/Spinner";

interface Profile {
  id: number;
  email: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  avatar: string;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function AccountProfilePage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState("");

  // Password change state lives separately so it doesn't accidentally
  // submit alongside the profile save.
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    customerFetch(`/api/account/profile`)
      .then(async (r) => (r.ok ? ((await r.json()) as Profile) : null))
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, [user]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    setSaving(true);
    setError("");
    try {
      const res = await customerFetch(`/api/account/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProfile(data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (pw.next !== pw.confirm) {
      setPwMessage({ type: "err", text: "Passwords don't match" });
      return;
    }
    if (pw.next.length < 8) {
      setPwMessage({
        type: "err",
        text: "New password must be at least 8 characters",
      });
      return;
    }
    setPwSaving(true);
    try {
      const res = await customerFetch(`/api/account/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: pw.current, new: pw.next }),
      });
      if (res.ok) {
        setPw({ current: "", next: "", confirm: "" });
        setPwMessage({ type: "ok", text: "Password updated" });
      } else {
        const data = await res.json().catch(() => ({}));
        setPwMessage({
          type: "err",
          text: data.error || "Could not update password",
        });
      }
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading profile…" />;
  if (!profile) return <p className="text-sm text-red-600">Couldn&apos;t load your profile.</p>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Profile settings
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Update your contact details and shipping address. These pre-fill
          checkout and appear on your course certificates.
        </p>
      </header>

      <form
        onSubmit={save}
        className="space-y-6 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Personal details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink/70">
              Full name
            </label>
            <input
              required
              value={profile.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Email</label>
            <input
              value={profile.email}
              disabled
              className={inputClass + " bg-ink/[0.04] text-ink/55"}
            />
            <p className="mt-1 text-xs text-ink/45">
              Email changes need staff help — open a support ticket.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+254 700 000 000"
              className={inputClass}
            />
          </div>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Shipping address
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink/70">
              Address line 1
            </label>
            <input
              value={profile.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
              placeholder="Building, street"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink/70">
              Address line 2
            </label>
            <input
              value={profile.addressLine2}
              onChange={(e) => set("addressLine2", e.target.value)}
              placeholder="Apt, suite (optional)"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">City</label>
            <input
              value={profile.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              State / County
            </label>
            <input
              value={profile.state}
              onChange={(e) => set("state", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Postal code
            </label>
            <input
              value={profile.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Country</label>
            <input
              value={profile.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Kenya"
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving && <Spinner size="sm" />}
            {saving ? "Saving…" : "Save profile"}
          </button>
          {savedFlash && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Saved
            </span>
          )}
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Change password
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-ink/70">
              Current password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              New password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Confirm new
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        {pwMessage && (
          <p
            className={`text-sm ${pwMessage.type === "ok" ? "text-emerald-700" : "text-red-600"}`}
          >
            {pwMessage.text}
          </p>
        )}
        <button
          type="submit"
          disabled={pwSaving}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 hover:bg-ink/5 disabled:opacity-50"
        >
          {pwSaving && <Spinner size="sm" />}
          {pwSaving ? "Updating…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
