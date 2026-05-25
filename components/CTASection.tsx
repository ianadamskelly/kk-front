import Link from "next/link";

export default function CTASection({
  title = "Ready to bring your vision to life?",
  description = "Tell us what you're building. We'll help you shape it into something people remember.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-12">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream/70">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Start your project
          </Link>
          <Link
            href="/portfolio"
            className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-cream/10"
          >
            See our work
          </Link>
        </div>
      </div>
    </section>
  );
}
