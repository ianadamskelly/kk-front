import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchService, fetchServices } from "@/lib/api";
import CTASection from "@/components/CTASection";
import ContentHTML from "@/components/ContentHTML";
import Breadcrumbs from "@/components/Breadcrumbs";
import ServiceIcon from "@/components/icons/ServiceIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchService(slug);
  return {
    title: service?.title ?? "Service not found",
    description: service?.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, all] = await Promise.all([
    fetchService(slug),
    fetchServices(),
  ]);
  if (!service) notFound();

  const others = all.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className="space-y-20 pb-8">
      {/* Hero — gradient backdrop with a big tile icon on the right */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-cream to-cream"
        />
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
          <Breadcrumbs
            items={[
              { href: "/services", label: "Services" },
              { label: service.title },
            ]}
          />
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                Service
              </span>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {service.title}
              </h1>
              {service.summary && (
                <p className="mt-5 max-w-xl text-lg text-ink/65">
                  {service.summary}
                </p>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Start a project
                </Link>
                <Link
                  href="/portfolio"
                  className="rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink/80 transition hover:bg-ink/5"
                >
                  See related work
                </Link>
              </div>
            </div>

            {/* Big iconic tile balancing the hero */}
            <div className="mx-auto w-full max-w-sm">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-100 via-cream to-brand-50">
                <div className="absolute inset-0 flex items-center justify-center text-brand-500">
                  <ServiceIcon title={service.title} className="h-32 w-32" />
                </div>
                {/* Decorative sparkles */}
                <span className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full bg-brand-400/70" />
                <span className="absolute bottom-8 left-10 h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span className="absolute bottom-12 right-10 h-3 w-3 rounded-full bg-brand-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      {service.body && (
        <article className="mx-auto max-w-3xl px-4">
          <ContentHTML html={service.body} />
        </article>
      )}

      {/* Sibling services rail */}
      {others.length > 0 && (
        <section className="mx-auto max-w-3xl px-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            More services
          </h2>
          <ul className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
            {others.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services/${s.slug}`}
                  className="flex items-center gap-4 px-5 py-4 text-sm hover:bg-ink/[0.02]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <ServiceIcon title={s.title} className="h-5 w-5" />
                  </span>
                  <span className="flex-1 font-medium text-ink">{s.title}</span>
                  <span className="text-brand-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CTASection
        title={`Need help with ${service.title.toLowerCase()}?`}
        description="Tell us about your project and we'll put the right team on it."
      />
    </div>
  );
}
