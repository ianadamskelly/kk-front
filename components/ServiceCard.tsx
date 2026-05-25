import Link from "next/link";
import { Service } from "@/lib/api";
import ServiceIcon from "./icons/ServiceIcons";

// ServiceCard now renders an SVG service icon in a brand-tinted tile,
// with a soft gradient backdrop appearing on hover for extra warmth.
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >
      {/* Soft gradient that fades in on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50/0 via-white to-brand-50/0 opacity-0 transition group-hover:opacity-100"
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
        <ServiceIcon title={service.title} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink">{service.title}</h3>
      {service.summary && (
        <p className="mt-2 flex-1 text-sm text-ink/60">{service.summary}</p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        Explore service
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
