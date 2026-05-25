"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { setToken } from "@/lib/auth";

interface InvitePreview {
  email: string;
  name: string;
  roleName: string;
  roleKey: string;
  expiresAt: string;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Preview the invite first so we can show who/what they're accepting,
  // and so a stale/expired link doesn't show a password form for no reason.
  useEffect(() => {
    fetch(`${API_URL}/api/invitations/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || "Invitation not available");
          return;
        }
        setPreview(data);
        setName(data.name || "");
      })
      .catch(() => setLoadError("Could not reach the server"))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/invitations/${encodeURIComponent(token)}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not accept invite");
      // Store the JWT under the admin token key so the user lands signed in.
      setToken(data.token);
      router.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-ink/50">
        Loading invitation&hellip;
      </div>
    );
  }

  if (loadError || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invitation not available
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          {loadError ||
            "This invitation may have already been used, expired, or been revoked."}
        </p>
        <p className="mt-6 text-sm text-ink/55">
          Ask the person who invited you to send a fresh link.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        You&apos;re invited
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Join Kuza Kizazi
      </h1>
      <p className="mt-3 text-sm text-ink/65">
        You&apos;re accepting an invitation for{" "}
        <span className="font-medium text-ink">{preview.email}</span> as a{" "}
        <span className="font-medium text-brand-700">{preview.roleName}</span>.
        Set a password to finish creating your account.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <div>
          <label className="text-sm font-medium text-ink/70">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Ada Lovelace"
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-ink/70">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-ink/70">
            Confirm password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Setting up…" : "Accept invitation"}
        </button>
        <p className="mt-3 text-xs text-ink/45">
          This link expires {new Date(preview.expiresAt).toLocaleString()}.
        </p>
      </form>
    </div>
  );
}
