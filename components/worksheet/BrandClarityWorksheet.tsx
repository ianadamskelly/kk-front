"use client";

import { useEffect, useMemo, useState } from "react";
import { customerFetch } from "@/lib/customer";

type Prompt =
  | { kind: "textarea"; key: string; label: string; help?: string; tall?: boolean }
  | { kind: "input"; key: string; label: string; help?: string }
  | { kind: "values"; keys: string[] }
  | { kind: "competitors" }
  | { kind: "reasons" }
  | { kind: "sliders"; sliders: { key: string; left: string; right: string }[] }
  | { kind: "wordbank" }
  | { kind: "messages" }
  | { kind: "palette" };

interface Exercise {
  sw: string;
  en: string;
  intro: string;
  prompts: Prompt[];
  example: { biz: string; html: string };
}

interface Entitlement {
  id: number;
  assetSlug: string;
  assetName: string;
  licenseId: string;
  usesRemaining: number;
}

interface Props {
  entitlement: Entitlement;
  userId: number;
  userEmail: string;
}

const EXERCISES: Exercise[] = [
  {
    sw: "Kusudi",
    en: "Your Why — Purpose, Mission & Vision",
    intro:
      "Every strong brand stands on a clear reason for being. Before logos and colours, get honest about why your business matters — to you and to the people you serve.",
    prompts: [
      { kind: "textarea", key: "purpose", tall: true, label: "Why does your business exist — beyond making money?", help: "The deeper change or value you want to create in your community." },
      { kind: "textarea", key: "mission", label: "Your mission — what you do, for whom, right now.", help: "One or two sentences. Present tense." },
      { kind: "textarea", key: "vision", label: "Your vision — the future you are working toward.", help: "Where do you want this business to be in 5 years?" },
    ],
    example: { biz: "Mama Asha's Kitchen (Nairobi)", html: "<p><b>Purpose:</b> To prove that healthy, home-style Kenyan food can be fast and affordable for busy workers.</p><p><b>Mission:</b> We serve fresh, balanced lunches to office workers in the CBD, delivered by 12:30 every day.</p><p><b>Vision:</b> To become the trusted everyday kitchen in five major towns, employing local cooks in each.</p>" },
  },
  {
    sw: "Misingi",
    en: "Core Values — Your Foundations",
    intro:
      "Values are the beliefs that guide how you treat customers, staff and money — especially when things get hard. Choose 3–5 you would never compromise on.",
    prompts: [{ kind: "values", keys: ["v1", "v2", "v3", "v4", "v5"] }],
    example: { biz: "Boda Plus (Kampala)", html: "<p><b>Safety first</b> — every rider is trained and insured before their first trip.</p><p><b>Respect</b> — we greet every customer by name and never overcharge.</p><p><b>Reliability</b> — if we say 10 minutes, we mean 10 minutes.</p>" },
  },
  {
    sw: "Hadithi",
    en: "Your Brand Story",
    intro:
      "People remember stories, not statistics. A clear origin story builds trust and makes your brand human. Tell yours simply and truthfully.",
    prompts: [
      { kind: "textarea", key: "story_spark", tall: true, label: "How did it start? What was the spark or moment?", help: "The problem you noticed, or the day you decided to begin." },
      { kind: "textarea", key: "story_challenge", label: "What challenge were you setting out to solve?" },
      { kind: "textarea", key: "story_journey", label: "What have you learned or overcome since then?" },
    ],
    example: { biz: "Tujenge Crafts (Arusha)", html: "<p><b>The spark:</b> Three women weavers couldn't reach buyers beyond the local market. We started a shared stall, then a website.</p><p><b>The challenge:</b> Tourists loved the work but couldn't find it online or pay easily.</p><p><b>The journey:</b> We learned to photograph, price and ship — and now 40 artisans sell through one trusted name.</p>" },
  },
  {
    sw: "Mteja Wako",
    en: "Your Ideal Customer",
    intro:
      "You cannot speak to everyone. The clearer you are about one ideal customer, the more your brand will pull them in. Picture one real person.",
    prompts: [
      { kind: "textarea", key: "cust_who", label: "Who are they? Age, work, location, life stage.", help: "e.g. Young mothers, 25–35, in Mombasa, running small shops." },
      { kind: "textarea", key: "cust_want", tall: true, label: "What do they want, and what frustrates them today?" },
      { kind: "textarea", key: "cust_where", label: "Where do they spend their time and attention?", help: "WhatsApp, Instagram, radio, church/mosque, the market, matatu routes…" },
      { kind: "textarea", key: "cust_voice", label: "In their own words: “I wish I could find someone who…”" },
    ],
    example: { biz: "Mama Asha's Kitchen", html: "<p><b>Who:</b> Office workers, 24–40, in Nairobi CBD, short on time at lunch.</p><p><b>Wants:</b> A filling, healthy meal that doesn't cost much or take long.</p><p><b>Where:</b> WhatsApp groups, Instagram, and walking past on Kimathi Street.</p><p><b>In their words:</b> “I wish I could find a hot, balanced lunch without queuing for 30 minutes.”</p>" },
  },
  {
    sw: "Nafasi Sokoni",
    en: "Market Position & Competitors",
    intro:
      "Knowing who else your customer could choose helps you find the gap only you can fill. Be honest — competitors include “doing nothing” too.",
    prompts: [{ kind: "competitors" }, { kind: "textarea", key: "pos_gap", tall: true, label: "What gap or need is nobody serving well? That is your opening.", help: "The thing customers complain about that you can do better." }],
    example: { biz: "Boda Plus", html: "<p><b>Alternatives:</b> Street boda riders (cheap, but unsafe) · ride-hailing apps (pricey, slow in traffic) · walking.</p><p><b>The gap:</b> Nobody offered trained, insured riders at a fair fixed price — so safety became our position.</p>" },
  },
  {
    sw: "Tofauti Yako",
    en: "Your Unique Value Proposition",
    intro:
      "Your UVP is the one clear promise that sets you apart. Fill the blanks until it feels true and specific — then say it out loud.",
    prompts: [{ kind: "textarea", key: "uvp_statement", tall: true, label: "We help ______ to ______ by ______, unlike ______.", help: "Keep refining until every blank is specific." }, { kind: "reasons" }],
    example: { biz: "Tujenge Crafts", html: "<p><b>UVP:</b> We help East African artisans to reach global buyers by handling photos, pricing and shipping — unlike middlemen who pay them too little.</p><p><b>Why choose us:</b> fair pay to makers · authentic handmade goods · easy mobile-money checkout.</p>" },
  },
  {
    sw: "Tabia",
    en: "Brand Personality",
    intro:
      "If your brand walked into a room, how would it feel? Drag each slider to where your brand sits. There are no wrong answers — only choices that fit your customer.",
    prompts: [
      { kind: "sliders", sliders: [
        { key: "p_formal", left: "Formal & professional", right: "Warm & playful" },
        { key: "p_premium", left: "Premium & exclusive", right: "Everyday & accessible" },
        { key: "p_trad", left: "Traditional & rooted", right: "Modern & bold" },
        { key: "p_calm", left: "Calm & reassuring", right: "Energetic & loud" },
      ] },
      { kind: "textarea", key: "p_words", label: "If your brand were a person, three words to describe them:", help: "e.g. dependable, friendly, ambitious." },
    ],
    example: { biz: "Mama Asha's Kitchen", html: "<p>Leans <b>warm & playful</b>, <b>everyday & accessible</b>, <b>modern</b>, and gently <b>energetic</b>.</p><p><b>Three words:</b> homely, fresh, dependable.</p>" },
  },
  {
    sw: "Sauti",
    en: "Brand Voice & Tone",
    intro:
      "Your voice is how your brand speaks — in captions, signage, and replies. Consistency makes you recognisable and trustworthy.",
    prompts: [
      { kind: "textarea", key: "voice_like", label: "We sound like… (describe your tone)", help: "e.g. a friendly neighbour who knows their craft." },
      { kind: "textarea", key: "voice_never", label: "We never sound like…" },
      { kind: "wordbank" },
      { kind: "textarea", key: "voice_sample", label: "Write one real message in your voice — e.g. greeting a customer on WhatsApp." },
    ],
    example: { biz: "Boda Plus", html: "<p><b>We sound like:</b> a reliable friend — clear, calm, and respectful.</p><p><b>We never sound like:</b> pushy or careless.</p><p><b>WhatsApp greeting:</b> Karibu! Your rider David is 4 minutes away on a Boda Plus bike. Safe trip ahead.</p>" },
  },
  {
    sw: "Mwonekano",
    en: "Visual Identity Direction",
    intro:
      "This is a feeling, not a final design — it guides your colours, type and imagery. Tick the moods that fit your brand, then describe the look.",
    prompts: [
      { kind: "palette" },
      { kind: "textarea", key: "vis_type", label: "Should your type feel modern, classic, or handmade? Why?" },
      { kind: "textarea", key: "vis_imagery", label: "Three words for your imagery & overall mood.", help: "e.g. bright, natural, hopeful." },
      { kind: "textarea", key: "vis_places", label: "Where will your brand show up? List the real touchpoints.", help: "Signage, packaging, M-Pesa till name, delivery bag, Instagram, receipts…" },
    ],
    example: { biz: "Tujenge Crafts", html: "<p><b>Mood chosen:</b> Natural & grounded + Warm & energetic.</p><p><b>Type:</b> Handmade-feeling, to echo the craft.</p><p><b>Imagery:</b> earthy, handmade, proud.</p><p><b>Shows up on:</b> swing tags, the website, woven-bag packaging and Instagram reels.</p>" },
  },
  {
    sw: "Ujumbe",
    en: "Tagline & Key Messages",
    intro:
      "Now pull it together into words people can repeat. A great tagline is short, true, and only fits your brand.",
    prompts: [
      { kind: "input", key: "tag1", label: "Tagline draft 1" },
      { kind: "input", key: "tag2", label: "Tagline draft 2" },
      { kind: "input", key: "tag3", label: "Tagline draft 3" },
      { kind: "textarea", key: "pitch", label: "Your one-sentence pitch — what you'd say in a matatu queue.", help: "We're the ___ that helps ___ to ___." },
      { kind: "messages" },
    ],
    example: { biz: "Mama Asha's Kitchen", html: "<p><b>Taglines:</b> Lunch, done right. · Fresh food, on time. · Your midday home cooking.</p><p><b>Pitch:</b> We're the CBD kitchen that gets busy workers a fresh, balanced lunch by 12:30.</p>" },
  },
];

const PALETTES = [
  ["Warm & energetic", "orange, sunset", "linear-gradient(135deg,#ff7a1a,#ff5f00)"],
  ["Natural & grounded", "greens, earth", "linear-gradient(135deg,#6fc25f,#1f6b2c)"],
  ["Bold & confident", "deep reds", "linear-gradient(135deg,#e23b3b,#a01818)"],
  ["Trustworthy", "calm blues", "linear-gradient(135deg,#3d8bd4,#1d4f87)"],
  ["Premium", "black & gold", "linear-gradient(135deg,#2a2a2a,#1b1a17)"],
  ["Fresh & clean", "teal, mint", "linear-gradient(135deg,#3fc4b0,#157d70)"],
  ["Playful & bright", "sunny yellow", "linear-gradient(135deg,#ffd34d,#ffb300)"],
  ["Elegant & soft", "muted plum", "linear-gradient(135deg,#9b7bb0,#5e4274)"],
];

const SYNTHESIS_KEYS = ["bcs_name", "bcs_purpose", "bcs_audience", "bcs_outcome", "bcs_personality", "bcs_value"];

export default function BrandClarityWorksheet({ entitlement, userId, userEmail }: Props) {
  const storagePrefix = `kkk-bcw:${userId}:${entitlement.licenseId}:`;
  const [values, setValues] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState("");
  const [usesRemaining, setUsesRemaining] = useState(entitlement.usesRemaining);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(storagePrefix)) {
        loaded[key.slice(storagePrefix.length)] = localStorage.getItem(key) || "";
      }
    }
    setValues(loaded);
  }, [storagePrefix]);

  const trackedKeys = useMemo(() => {
    const keys: string[] = [];
    EXERCISES.forEach((ex) => ex.prompts.forEach((p) => collectKeys(p, keys)));
    keys.push(...SYNTHESIS_KEYS);
    return keys;
  }, []);

  const progress = useMemo(() => {
    const filled = trackedKeys.filter((key) => (values[key] || "").trim().length > 1).length;
    const palette = PALETTES.some((_, i) => values[`pal_${i}`] === "1") ? 1 : 0;
    return Math.round(((filled + palette) / (trackedKeys.length + 1)) * 100);
  }, [trackedKeys, values]);

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    try {
      localStorage.setItem(storagePrefix + key, value);
      setSaveState("Saved");
      window.setTimeout(() => setSaveState(""), 1200);
    } catch {
      setSaveState("");
    }
  };

  const clearAll = () => {
    if (!window.confirm("Clear all your answers on this device? This cannot be undone.")) return;
    Object.keys(values).forEach((key) => localStorage.removeItem(storagePrefix + key));
    setValues({});
  };

  const exportPDF = async () => {
    setError("");
    setExporting(true);
    try {
      const res = await customerFetch(`/api/account/assets/${entitlement.assetSlug}/export`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export was not approved.");
      setUsesRemaining(data.entitlement.usesRemaining);
      window.setTimeout(() => window.print(), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bcw">
      <div className="bcw-toolbar">
        <div className="bcw-brand">
          <span className="bcw-mark">Kuza Kizazi</span>
          <span>Brand Clarity Worksheet</span>
        </div>
        <div className="bcw-spacer" />
        <div className="bcw-progress" aria-label={`${progress}% complete`}>
          <div><span style={{ width: `${progress}%` }} /></div>
          <b>{progress}%</b>
        </div>
        <span className="bcw-save">{saveState}</span>
        <button type="button" className="bcw-btn ghost" onClick={clearAll}>Clear</button>
        <button type="button" className="bcw-btn primary" onClick={exportPDF} disabled={exporting || usesRemaining <= 0}>
          {exporting ? "Authorizing…" : usesRemaining <= 0 ? "No exports left" : "Save as PDF"}
        </button>
      </div>
      {error && <p className="bcw-error">{error}</p>}
      <div className="bcw-license">Watermark: {userEmail} · {entitlement.licenseId} · {usesRemaining} exports left</div>
      <main className="bcw-sheets">
        <Cover values={values} update={update} watermark={`${userEmail} · ${entitlement.licenseId}`} />
        <Intro watermark={`${userEmail} · ${entitlement.licenseId}`} />
        {EXERCISES.map((ex, i) => (
          <section className="bcw-page" key={ex.sw}>
            <Watermark text={`${userEmail} · ${entitlement.licenseId}`} />
            <div className="bcw-ex-head">
              <div className="bcw-ex-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <p>Exercise {String(i + 1).padStart(2, "0")}</p>
                <h2>{ex.sw}</h2>
                <span>{ex.en}</span>
              </div>
            </div>
            <p className="bcw-intro">{ex.intro}</p>
            {ex.prompts.map((prompt, idx) => (
              <PromptView key={idx} prompt={prompt} values={values} update={update} />
            ))}
            <div className="bcw-example">
              <span>Mfano · Worked Example</span>
              <p><b>{ex.example.biz}</b></p>
              <div dangerouslySetInnerHTML={{ __html: ex.example.html }} />
            </div>
            <Footer page={String(i + 2).padStart(2, "0")} />
          </section>
        ))}
        <Synthesis values={values} update={update} watermark={`${userEmail} · ${entitlement.licenseId}`} />
        <Closing watermark={`${userEmail} · ${entitlement.licenseId}`} />
      </main>
      <WorksheetStyles />
    </div>
  );
}

function collectKeys(prompt: Prompt, keys: string[]) {
  if (prompt.kind === "textarea" || prompt.kind === "input") keys.push(prompt.key);
  if (prompt.kind === "values") prompt.keys.forEach((k) => keys.push(`${k}_name`, `${k}_how`));
  if (prompt.kind === "competitors") [1, 2, 3].forEach((i) => keys.push(`comp${i}_name`, `comp${i}_good`));
  if (prompt.kind === "reasons") [1, 2, 3].forEach((i) => keys.push(`reason${i}`));
  if (prompt.kind === "sliders") prompt.sliders.forEach((s) => keys.push(s.key));
  if (prompt.kind === "wordbank") keys.push("words_use", "words_avoid");
  if (prompt.kind === "messages") [1, 2, 3].forEach((i) => keys.push(`msg${i}`));
}

function PromptView({ prompt, values, update }: { prompt: Prompt; values: Record<string, string>; update: (key: string, value: string) => void }) {
  if (prompt.kind === "textarea" || prompt.kind === "input") {
    return <Field kind={prompt.kind} k={prompt.key} label={prompt.label} help={prompt.help} tall={"tall" in prompt && prompt.tall} values={values} update={update} />;
  }
  if (prompt.kind === "values") {
    return <Block label="Name 3–5 core values, and how each one shows up day to day.">{prompt.keys.map((k, i) => <div className="bcw-row" key={k}><Field k={`${k}_name`} label={`Value ${i + 1}`} values={values} update={update} compact /><Field k={`${k}_how`} label="How it shows up in your business" values={values} update={update} compact /></div>)}</Block>;
  }
  if (prompt.kind === "competitors") {
    return <Block label="Who else could your customer choose? List up to three, and what each does well.">{[1, 2, 3].map((i) => <div className="bcw-row" key={i}><Field k={`comp${i}_name`} label={`Competitor / alternative ${i}`} values={values} update={update} compact /><Field k={`comp${i}_good`} label="What they do well" values={values} update={update} compact /></div>)}</Block>;
  }
  if (prompt.kind === "reasons") {
    return <Block label="Three clear reasons a customer should choose you over them."><div className="bcw-thirds">{[1, 2, 3].map((i) => <input key={i} value={values[`reason${i}`] || ""} onChange={(e) => update(`reason${i}`, e.target.value)} />)}</div></Block>;
  }
  if (prompt.kind === "sliders") {
    return <Block label="Where does your brand sit? Drag each slider.">{prompt.sliders.map((s) => <div className="bcw-slider" key={s.key}><div><span>{s.left}</span><span>{s.right}</span></div><input type="range" min="0" max="100" value={values[s.key] || "50"} onChange={(e) => update(s.key, e.target.value)} /></div>)}</Block>;
  }
  if (prompt.kind === "wordbank") {
    return <Block label="Five words you'll use often — and five you'll avoid."><div className="bcw-row"><Field k="words_use" label="Words we use" values={values} update={update} compact /><Field k="words_avoid" label="Words we avoid" values={values} update={update} compact /></div></Block>;
  }
  if (prompt.kind === "messages") {
    return <Block label="Three key messages every customer should walk away knowing.">{[1, 2, 3].map((i) => <Field key={i} k={`msg${i}`} label={`Key message ${i}`} values={values} update={update} compact />)}</Block>;
  }
  return <Block label="Which moods feel like your brand? Tap any that fit (choose 1–3)."><div className="bcw-palette">{PALETTES.map(([name, mood, bg], i) => <button type="button" key={name} className={values[`pal_${i}`] === "1" ? "on" : ""} onClick={() => update(`pal_${i}`, values[`pal_${i}`] === "1" ? "0" : "1")}><i style={{ background: bg }} /><b>{name}</b><span>{mood}</span></button>)}</div></Block>;
}

function Field({ k, label, help, kind = "input", tall = false, compact = false, values, update }: { k: string; label: string; help?: string; kind?: "input" | "textarea"; tall?: boolean; compact?: boolean; values: Record<string, string>; update: (key: string, value: string) => void }) {
  return <div className={compact ? "bcw-field compact" : "bcw-field"}><label>{label}</label>{help && <p>{help}</p>}{kind === "textarea" ? <textarea rows={tall ? 6 : 3} value={values[k] || ""} onChange={(e) => update(k, e.target.value)} /> : <input value={values[k] || ""} onChange={(e) => update(k, e.target.value)} />}</div>;
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="bcw-block"><h3>{label}</h3>{children}</div>;
}

function Cover({ values, update, watermark }: { values: Record<string, string>; update: (key: string, value: string) => void; watermark: string }) {
  return <section className="bcw-page bcw-cover"><Watermark text={watermark} /><p className="bcw-kicker">Kuza Brand Yako · Grow Your Brand</p><h1>Brand Clarity <em>Worksheet</em></h1><p>A guided workbook to help small businesses across East Africa discover who they are, who they serve, and what makes them unmistakably theirs.</p><div className="bcw-cover-fields"><Field k="prepared_for" label="Prepared for" values={values} update={update} compact /><Field k="prepared_date" label="Date" values={values} update={update} compact /></div><span className="bcw-badge">10 Exercises · ~60 mins</span></section>;
}

function Intro({ watermark }: { watermark: string }) {
  return <section className="bcw-page"><Watermark text={watermark} /><p className="bcw-kicker">Before you begin</p><h2>Why brand clarity matters</h2><p className="bcw-lede"><b>A brand is not your logo.</b> It is the gut feeling people have about your business — the promise they remember and the reason they choose you over the shop next door.</p><div className="bcw-grow"><div><b>01</b><span>Mbegu · The Seed</span><p>Your purpose and values.</p></div><div><b>02</b><span>Mche · The Sprout</span><p>Your customer, position and promise.</p></div><div><b>03</b><span>Mti · The Tree</span><p>Your voice and look.</p></div></div><Footer page="01" /></section>;
}

function Synthesis({ values, update, watermark }: { values: Record<string, string>; update: (key: string, value: string) => void; watermark: string }) {
  return <section className="bcw-page"><Watermark text={watermark} /><p className="bcw-kicker">Pulling it together</p><h2>Your Brand Clarity Statement</h2><p className="bcw-lede">Using your answers, complete this statement. When it reads true and clear, you've found your brand's core.</p><div className="bcw-statement"><p>We are <Inline k="bcs_name" values={values} update={update} />. We exist to <Inline k="bcs_purpose" values={values} update={update} />. We help <Inline k="bcs_audience" values={values} update={update} /> to <Inline k="bcs_outcome" values={values} update={update} />. We are <Inline k="bcs_personality" values={values} update={update} />, and above all we believe in <Inline k="bcs_value" values={values} update={update} />.</p></div><Footer page="12" /></section>;
}

function Inline({ k, values, update }: { k: string; values: Record<string, string>; update: (key: string, value: string) => void }) {
  return <input className="bcw-inline" value={values[k] || ""} onChange={(e) => update(k, e.target.value)} />;
}

function Closing({ watermark }: { watermark: string }) {
  return <section className="bcw-page bcw-closing"><Watermark text={watermark} /><h2>You've planted the seed.</h2><p className="bcw-lede">Brand clarity isn't a one-time task — revisit this worksheet as your business grows. The clearer your roots, the taller you can reach.</p><div className="bcw-cta"><b>Kuza Kizazi Kreative</b><p>Ready to turn these answers into a real identity — logo, colours, and a brand that grows with you? That's what we do.</p><span>hello@kuzakizazi.com · @kuzakizazikreative</span></div><Footer page="13" /></section>;
}

function Watermark({ text }: { text: string }) {
  return <div className="bcw-watermark">{text}</div>;
}

function Footer({ page }: { page: string }) {
  return <footer className="bcw-footer"><span>Kuza Kizazi Kreative · Brand Clarity</span><span>{page}</span></footer>;
}

function WorksheetStyles() {
  return <style jsx global>{`
    .bcw{--orange:#ff5f00;--leaf:#5bb851;--ink:#1b1a17;--soft:#4d4a44;--line:#e4ded3;--bg:#efe9df;color:var(--ink);font-family:Hanken Grotesk,system-ui,sans-serif}
    .bcw-toolbar{position:sticky;top:72px;z-index:20;margin:-1rem -1rem 1rem;display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:rgba(255,255,255,.92);padding:10px 12px;backdrop-filter:blur(10px)}
    .bcw-brand{display:flex;flex-wrap:wrap;gap:8px;font-size:12px;font-weight:700;color:var(--soft)}.bcw-mark{color:var(--orange)}.bcw-spacer{flex:1}.bcw-progress{display:flex;align-items:center;gap:8px}.bcw-progress div{height:7px;width:120px;overflow:hidden;border-radius:99px;background:#ffe3d2}.bcw-progress span{display:block;height:100%;background:var(--orange)}.bcw-progress b,.bcw-save{font-size:12px;color:var(--soft)}.bcw-save{min-width:42px}.bcw-btn{border:0;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:700}.bcw-btn.primary{background:var(--orange);color:white}.bcw-btn.ghost{background:#fff1e8;color:#d44f00}.bcw-btn:disabled{opacity:.55}.bcw-error{border-radius:12px;background:#fee2e2;padding:10px 12px;color:#991b1b}.bcw-license{margin-bottom:12px;font-size:12px;color:#6b6257}
    .bcw-sheets{display:flex;flex-direction:column;align-items:center;gap:28px}.bcw-page{position:relative;width:820px;max-width:100%;min-height:1040px;background:#fff;padding:64px;box-shadow:0 14px 34px rgba(27,26,23,.11);overflow:hidden}.bcw-cover{display:flex;flex-direction:column;justify-content:center}.bcw-cover h1{max-width:640px;font-size:70px;line-height:.96}.bcw-cover h1 em{color:var(--orange);font-style:normal}.bcw-cover>p{max-width:590px;font-size:20px;color:var(--soft)}.bcw-cover-fields{margin-top:56px;display:grid;grid-template-columns:1fr 180px;gap:18px}.bcw-badge{margin-top:20px;align-self:flex-start;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:12px;font-weight:800;color:var(--orange)}
    .bcw-kicker,.bcw-ex-head p{margin:0 0 12px;color:var(--orange);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.bcw-page h2{margin:0 0 16px;font-size:34px;line-height:1.05}.bcw-lede,.bcw-intro{font-size:18px;line-height:1.65;color:var(--soft)}.bcw-grow{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px}.bcw-grow div,.bcw-example,.bcw-statement,.bcw-cta{border:1px solid var(--line);background:#fffaf6;padding:18px}.bcw-grow b{display:block;color:var(--orange)}.bcw-grow span{font-weight:800}.bcw-ex-head{display:grid;grid-template-columns:74px 1fr;gap:18px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.bcw-ex-num{display:grid;place-items:center;width:66px;height:66px;border-radius:50%;background:#fff1e8;color:var(--orange);font-size:26px;font-weight:900}.bcw-ex-head h2{margin:0}.bcw-ex-head span{color:var(--soft);font-weight:700}
    .bcw-field,.bcw-block{margin-top:22px}.bcw-field label,.bcw-block h3{display:block;margin:0 0 8px;font-size:14px;font-weight:800;color:var(--ink)}.bcw-field p{margin:-2px 0 8px;color:#7a7268;font-size:13px}.bcw-field input,.bcw-field textarea,.bcw-thirds input,.bcw-inline{width:100%;border:0;border-bottom:2px solid var(--line);background:#f8f3ec;padding:10px 12px;font:inherit;outline:none}.bcw-field textarea{resize:vertical}.bcw-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.bcw-thirds{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.bcw-slider{margin:14px 0}.bcw-slider div{display:flex;justify-content:space-between;gap:14px;font-size:12px;font-weight:700;color:#7a7268}.bcw-slider input{width:100%;accent-color:var(--orange)}.bcw-palette{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bcw-palette button{border:1px solid var(--line);background:white;padding:10px;text-align:left}.bcw-palette button.on{border-color:var(--orange);box-shadow:inset 0 0 0 2px var(--orange)}.bcw-palette i{display:block;height:34px;margin-bottom:7px}.bcw-palette b,.bcw-palette span{display:block;font-size:12px}.bcw-palette span{color:#7a7268}.bcw-example{margin-top:26px}.bcw-example>span{font-size:12px;font-weight:900;color:#1f6b2c;text-transform:uppercase}.bcw-statement{font-size:23px;line-height:1.9}.bcw-inline{display:inline-block;width:155px;background:white}.bcw-watermark{position:absolute;right:22px;bottom:34px;transform:rotate(-90deg);transform-origin:right bottom;color:rgba(27,26,23,.26);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.bcw-footer{position:absolute;left:64px;right:64px;bottom:28px;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px;font-size:11px;color:#9a958c}.bcw-closing{display:flex;flex-direction:column;justify-content:center}.bcw-cta{margin-top:28px}.bcw-cta b{color:var(--orange)}
    @media(max-width:760px){.bcw-toolbar{top:64px;align-items:flex-start}.bcw-spacer,.bcw-progress{display:none}.bcw-page{min-height:auto;padding:32px 22px}.bcw-cover h1{font-size:44px}.bcw-row,.bcw-thirds,.bcw-palette,.bcw-grow,.bcw-cover-fields{grid-template-columns:1fr}.bcw-ex-head{grid-template-columns:1fr}.bcw-footer{position:static;margin-top:34px}.bcw-watermark{display:none}}
    @media print{body{background:white!important}.bcw-toolbar,.bcw-error,.bcw-license{display:none!important}.bcw-sheets{display:block}.bcw-page{width:auto;min-height:100vh;box-shadow:none;break-after:page;page-break-after:always}.bcw-page input,.bcw-page textarea{background:transparent!important}.bcw-watermark{display:block}}
  `}</style>;
}
