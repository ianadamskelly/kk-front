"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type Message = { role: "assistant" | "visitor"; text: string; handoff?: boolean };
const CHAT_API = "https://assistant.kuzakizazi.com/api/public/chat";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! Ask me about Kuza Kizazi’s services, process, resources, or how to get in touch." },
  ]);
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question || busy) return;
    setMessage("");
    setMessages((current) => [...current, { role: "visitor", text: question }]);
    setBusy(true);
    try {
      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "The chat is unavailable right now.");
      setMessages((current) => [...current, { role: "assistant", text: result.answer, handoff: result.handoff }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The chat is unavailable right now.";
      setMessages((current) => [...current, { role: "assistant", text: `${detail} You can reach us at kizazikuza@gmail.com or on our contact page.` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open && (
        <section aria-label="Kuza Kizazi chat" className="flex h-[min(600px,calc(100dvh_-_115px))] w-[min(380px,calc(100vw_-_32px))] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-brand-500 px-5 py-4 text-white">
            <div><p className="font-semibold">Kuza Kizazi</p><p className="text-xs text-white/80">Questions about our work</p></div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-white/15" aria-label="Close chat">×</button>
          </header>
          <div ref={feed} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto bg-cream p-4">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === "visitor" ? "self-end rounded-br-md bg-brand-500 text-white" : "self-start rounded-bl-md bg-white text-ink shadow-sm"}`}>
                <p className="whitespace-pre-wrap">{item.text}</p>
                {item.handoff && <p className="mt-2 text-xs opacity-70">Your question was forwarded to our team.</p>}
              </div>
            ))}
            {busy && <p className="self-start rounded-2xl bg-white px-4 py-3 text-sm text-ink/60">One moment…</p>}
          </div>
          <form onSubmit={submit} className="flex items-end gap-2 border-t border-ink/10 bg-white p-3">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} maxLength={4000} rows={1} placeholder="Ask about Kuza Kizazi…" aria-label="Your question" className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            <button type="submit" disabled={busy || !message.trim()} className="h-11 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-50">Send</button>
          </form>
          <p className="bg-white px-4 pb-3 text-center text-[11px] text-ink/50">This chat answers questions about Kuza Kizazi.</p>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close chat" : "Chat with Kuza Kizazi"} className="flex h-14 items-center gap-2 rounded-full bg-brand-500 px-5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
        <span aria-hidden="true" className="text-lg">{open ? "×" : "✳"}</span><span>{open ? "Close" : "Ask Kuza"}</span>
      </button>
    </div>
  );
}
