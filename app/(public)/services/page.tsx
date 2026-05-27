import type { Metadata } from "next";
import { fetchServices } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import {
  SERVICE_PILLARS,
  servicesForPillar,
  ungroupedServices,
} from "@/lib/service-pillars";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Branding, graphic design, web development, animation, photography, and digital marketing from Kuza Kizazi.",
};

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <div className="space-y-20 pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="What we do"
          title="Creative work built around your growth"
          description="From identity to digital platforms and ongoing content, our work is organised around three connected ways to help your brand grow."
        />
        {services.length > 0 ? (
          <div className="mt-12 space-y-16">
            {SERVICE_PILLARS.map((pillar) => {
              const items = servicesForPillar(services, pillar.key);
              if (items.length === 0) return null;
              return (
                <section key={pillar.key} id={pillar.anchor} className="scroll-mt-28">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">
                      {pillar.title}
                    </h2>
                    <p className="mt-2 text-ink/60">{pillar.description}</p>
                  </div>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              );
            })}
            {ungroupedServices(services).length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  Additional capabilities
                </h2>
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {ungroupedServices(services).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <p className="mt-10 text-ink/50">
            Our services are being prepared — check back soon.
          </p>
        )}
      </section>

      <section id="learning-and-resources" className="mx-auto max-w-6xl scroll-mt-28 px-4">
        <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Learning and resources
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Building skills or looking for practical tools?
              </h2>
              <p className="mt-3 text-ink/60">
                Our courses, membership, library, and shop are separate from client
                services and designed to support your own creative growth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {[
                ["/courses", "Courses"],
                ["/membership", "Membership"],
                ["/library", "Library"],
                ["/shop", "Shop"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-400"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
