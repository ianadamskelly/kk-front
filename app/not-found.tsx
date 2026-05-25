import Link from "next/link";
import NotFoundIllustration from "@/components/illustrations/NotFoundIllustration";

// NotFound is shown for any unmatched route. The aim is to convert "I
// hit a dead end" into "let me try one of these instead" — so we offer
// concrete next steps (home, services, insights, contact) alongside
// the illustration rather than just a bounce-to-home button.

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Page not found
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            We can&apos;t find that page
          </h1>
          <p className="mt-4 max-w-md text-sm text-ink/60 sm:text-base">
            The link may be old, broken, or just lost in the wild. Try one of
            the well-trodden paths below — we&apos;ll get you somewhere useful.
          </p>

          <ul className="mt-6 space-y-2">
            <Suggestion
              href="/"
              title="Back to the homepage"
              hint="Start fresh from the top"
            />
            <Suggestion
              href="/services"
              title="Browse our services"
              hint="Design, web, animation, marketing"
            />
            <Suggestion
              href="/insights"
              title="Read the latest insights"
              hint="Fresh thinking on craft and growth"
            />
            <Suggestion
              href="/contact"
              title="Get in touch"
              hint="Tell us what you were looking for"
            />
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <div className="kk-fade-up mx-auto max-w-md">
            <NotFoundIllustration className="h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Suggestion({
  href,
  title,
  hint,
}: {
  href: string;
  title: string;
  hint: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold text-ink group-hover:text-brand-600">
            {title}
          </p>
          <p className="text-xs text-ink/55">{hint}</p>
        </div>
        <span
          aria-hidden="true"
          className="text-brand-600 transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </li>
  );
}
