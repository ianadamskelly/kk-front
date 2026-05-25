import type { Metadata } from "next";
import { fetchServices } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import CTASection from "@/components/CTASection";

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
          title="Services that empower"
          description="We combine strategic thinking with creative excellence to deliver digital solutions that drive real business growth."
        />
        {services.length > 0 ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink/50">
            Our services are being prepared — check back soon.
          </p>
        )}
      </section>

      <CTASection />
    </div>
  );
}
