import type { Metadata } from "next";
import { fetchSettings, fetchTeam, fetchStats } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import StatsBand from "@/components/StatsBand";
import TeamCard from "@/components/TeamCard";
import CTASection from "@/components/CTASection";
import FaqSection from "@/components/FaqSection";
import { AboutGrowthGraphic } from "@/components/LandingGraphics";

// FAQ entries shown at the bottom of /about. These intentionally cover
// the cross-product questions a prospective customer is most likely to
// have — quick to skim, all answerable in plain language without sales
// fluff. Edit/extend the array to keep them current.
const FAQS = [
  {
    question: "What kind of work does Kuza Kizazi take on?",
    answer:
      "We cover the full creative stack: brand identity, graphic design, web development, animation and video, photography, and ongoing digital marketing. If it touches your brand's look, story, or digital presence, we can help.",
  },
  {
    question: "How does the monthly membership work?",
    answer:
      "Library membership is $1.90/month for members-only resources. Full membership is $10/month and unlocks every paid course in the catalogue plus the Resource Library. Renewal is manual — each payment extends your membership by 30 days, nothing auto-charges your card. Cancel any time.",
  },
  {
    question: "Do I own my courses forever once I buy them?",
    answer:
      "Yes. A one-off course purchase gives you lifetime access to that course's lessons and updates. Membership is a separate path that unlocks the whole catalogue while it's active.",
  },
  {
    question: "How do I get a quote for a custom project?",
    answer:
      "Use the contact form on the Contact page or email info@kuzakizazi.com with a few lines about your goals and timeline. We'll come back within two working days with next steps and a rough estimate.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Card, mobile money, and bank transfer via Flutterwave for KES and USD. We also support Sifalo Pay for Somali mobile wallets (eDahab, EVC, Zaad) in USD. Shop and course purchases checkout through the same flow.",
  },
  {
    question: "Can I get a refund if a course isn't right for me?",
    answer:
      "Open a support ticket from your account dashboard within 14 days of purchase and we'll work it out. We'd much rather understand what went wrong and either fix it or refund — whichever leaves you happiest.",
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Kuza Kizazi — meaning 'Grow the Generation' — is a Nairobi creative agency building enduring brands across Africa.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    title: "Passion-driven",
    body: "Creative work that exceeds expectations, because we genuinely care about the outcome.",
  },
  {
    title: "Excellence in execution",
    body: "Detail-oriented planning and precision craft on every deliverable.",
  },
  {
    title: "Innovation at core",
    body: "We stay current with the tools and ideas shaping the industry.",
  },
];

export default async function AboutPage() {
  const [settings, team, stats] = await Promise.all([
    fetchSettings(),
    fetchTeam(),
    fetchStats(),
  ]);

  return (
    <div className="space-y-24 pb-8">
      {/* Intro */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Who we are
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Creative work that helps brands grow
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/60">
              Based in Nairobi, Kuza Kizazi is a collective of designers,
              developers, and strategists focused on building brands that endure.
            </p>
          </div>
          <AboutGrowthGraphic className="mx-auto aspect-[500/390] w-full max-w-md lg:max-w-none" />
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Our story"
            title="From a boutique studio to a full-service agency"
          />
          <div className="space-y-4 text-ink/70">
            <p>
              Kuza Kizazi — Swahili for &ldquo;Grow the Generation&rdquo; —
              began as a small design studio with an outsized belief: that
              African brands deserve world-class creative work.
            </p>
            <p>
              Today we are a full-service creative agency spanning brand
              identity, animation, web development, and digital marketing —
              helping each client find a voice that is unmistakably their own.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-white p-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Mission
            </h3>
            <p className="mt-3 text-lg text-ink/80">
              To transform concepts into compelling stories and products that
              foster lasting emotional connections between brands and people.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Vision
            </h3>
            <p className="mt-3 text-lg text-ink/80">
              To become a recognised creative leader across Africa, known for
              building scalable brand identities with global impact.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="What guides us" title="Our core values" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-ink/10 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <StatsBand stats={stats} variant="light" />
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="The people"
            title="Meet the creative team"
            description="A close-knit team of makers behind every Kuza Kizazi project."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <TeamCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FaqSection eyebrow="Got questions?" title="FAQ" items={FAQS} />

      <CTASection
        title="Let's build something that lasts"
        description={`Reach us at ${
          settings.contact_email || "info@kuzakizazi.com"
        } or start a project below.`}
      />
    </div>
  );
}
