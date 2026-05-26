import Link from "next/link";
import {
  fetchSettings,
  fetchServices,
  fetchProjects,
  fetchTestimonials,
  fetchStats,
  fetchPosts,
} from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import ProjectCard from "@/components/ProjectCard";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import StatsBand from "@/components/StatsBand";
import PostCard from "@/components/PostCard";
import CTASection from "@/components/CTASection";
import FadeIn from "@/components/FadeIn";
import TrustLogoStrip from "@/components/TrustLogoStrip";

export default async function HomePage() {
  const [settings, services, projects, testimonials, stats, postList] =
    await Promise.all([
      fetchSettings(),
      fetchServices(),
      fetchProjects(),
      fetchTestimonials(),
      fetchStats(),
      fetchPosts({ perPage: 3 }),
    ]);

  return (
    <div className="space-y-24 pb-8">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <span className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          {settings.tagline || "Creative agency · Nairobi"}
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {settings.hero_title || "We turn bold visions into digital reality."}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/60">
          {settings.hero_subtitle ||
            "Kuza Kizazi is a creative agency crafting brands, websites, and stories that move people."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Start your project
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            Explore services
          </Link>
        </div>
      </section>

      {/* Trust strip — sits just below the hero so the page has social proof above the fold. */}
      <TrustLogoStrip />

      {/* Intro */}
      <FadeIn as="section" className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 rounded-3xl border border-ink/10 bg-white p-8 sm:p-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Who we are"
            title="A creative partner, not just a vendor"
            description="From a boutique design studio to a full-service creative agency, we help brands find their voice through design, animation, and web development."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold text-ink">
                Innovative solutions
              </h3>
              <p className="mt-1 text-sm text-ink/60">
                We pair strategic thinking with craft to solve real business
                problems — not just make things look good.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Agile growth</h3>
              <p className="mt-1 text-sm text-ink/60">
                Built to scale with you, from first launch to long-term
                partnership.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Services */}
      <FadeIn as="section" className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="What we do"
          title="Services that empower"
          description="We combine strategy and creative excellence to deliver work that drives real growth."
        />
        {services.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s, i) => (
              <FadeIn key={s.id} delay={Math.min(i, 5) * 60}>
                <ServiceCard service={s} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink/50">Services are being prepared.</p>
        )}
        <div className="mt-8">
          <Link
            href="/services"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            See all services →
          </Link>
        </div>
      </FadeIn>

      {/* Featured work */}
      <FadeIn as="section" className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Selected work"
          title="Crafting experiences that push boundaries"
        />
        {projects.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p, i) => (
              <FadeIn key={p.id} delay={i * 80}>
                <ProjectCard project={p} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink/50">Case studies coming soon.</p>
        )}
        <div className="mt-8">
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            View full portfolio →
          </Link>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.length > 0 && (
        <FadeIn as="section" className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-ink p-8 sm:p-12">
            <SectionHeading
              eyebrow="By the numbers"
              title="Trusted by brands across borders"
              light
            />
            <div className="mt-8">
              <StatsBand stats={stats} variant="dark" />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <FadeIn as="section" className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Kind words"
            title="What our clients say"
          />
          <div className="mt-10">
            <TestimonialsMarquee testimonials={testimonials} />
          </div>
        </FadeIn>
      )}

      {/* Insights */}
      {postList.posts.length > 0 && (
        <FadeIn as="section" className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Insights"
            title="Ideas worth sharing"
            description="Deep-dives on design, strategy, and technology from our team."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postList.posts.map((p, i) => (
              <FadeIn key={p.id} delay={Math.min(i, 5) * 60}>
                <PostCard post={p} />
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <CTASection />
      </FadeIn>
    </div>
  );
}
