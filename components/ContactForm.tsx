"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  service: "",
  subject: "",
  message: "",
};

export default function ContactForm({ services }: { services: string[] }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send your message");
      setStatus("done");
      setMessage(data.message || "Thanks for reaching out!");
      setForm(EMPTY);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="text-lg font-semibold text-brand-700">Message sent</p>
        <p className="mt-2 text-sm text-brand-700/80">{message}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink/70">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Service</label>
          <select
            value={form.service}
            onChange={(e) => set("service", e.target.value)}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">— Select a service —</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-ink/70">Subject</label>
        <input
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink/70">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Start a project"}
      </button>
    </form>
  );
}
