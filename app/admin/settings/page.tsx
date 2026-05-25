"use client";

import { useEffect, useState } from "react";
import { adminFetch, SiteSettings } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Spinner, { LoadingBlock } from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

const SECTIONS: { title: string; fields: { key: string; label: string; textarea?: boolean }[] }[] =
  [
    {
      title: "Brand",
      fields: [
        { key: "site_name", label: "Site name" },
        { key: "tagline", label: "Tagline", textarea: true },
        {
          key: "footer_description",
          label: "Footer description (long blurb under the brand)",
          textarea: true,
        },
        { key: "hero_title", label: "Homepage hero title", textarea: true },
        {
          key: "hero_subtitle",
          label: "Homepage hero subtitle",
          textarea: true,
        },
      ],
    },
    {
      title: "Contact",
      fields: [
        { key: "contact_email", label: "Email" },
        { key: "contact_phone", label: "Phone" },
        { key: "contact_address", label: "Address" },
      ],
    },
    {
      title: "Social links",
      fields: [
        { key: "social_facebook", label: "Facebook URL" },
        { key: "social_instagram", label: "Instagram URL" },
        { key: "social_twitter", label: "Twitter URL" },
        { key: "social_linkedin", label: "LinkedIn URL" },
      ],
    },
  ];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/api/admin/settings", getToken() || "");
        if (!res.ok) throw new Error("Failed to load settings");
        setSettings((await res.json()) || {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (key: string, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await adminFetch("/api/admin/settings", getToken() || "", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      setSettings((await res.json()) || {});
      setMessage("Settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <LoadingBlock label="Loading settings…" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Site settings
      </h1>
      <p className="text-sm text-ink/50">
        Brand copy, contact details, and social links used across the site.
      </p>

      <div className="mt-6 space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-ink/10 bg-white p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-ink/70">
                    {field.label}
                  </label>
                  {field.textarea ? (
                    <textarea
                      rows={2}
                      value={settings[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      className={`mt-1 ${inputClass}`}
                    />
                  ) : (
                    <input
                      value={settings[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      className={`mt-1 ${inputClass}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {saving && <Spinner size="sm" />}
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
