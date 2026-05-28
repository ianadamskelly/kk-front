import Link from "next/link";

// MemberGateCTA is the standard "this is members-only" panel shown to
// non-members at the top of any gated section. It deliberately offers
// two paths — sign in (for returning customers) and join (for everyone
// else) — so neither audience has to puzzle out which button is theirs.
interface Props {
  // Path the visitor will be returned to after signing in / signing up.
  returnTo?: string;
  // Optional override of the headline + lead so the same component can
  // power gates beyond the library (e.g. premium course bundles).
  title?: string;
  description?: string;
  // Bullet points listing what unlocks. Defaults focus on the library.
  perks?: string[];
}

export default function MemberGateCTA({
  returnTo = "/library",
  title = "Unlock the resource library",
  description = "Templates, guides, and tools to grow your brand — included with every Kuza Kizazi membership.",
  perks = [
    "Download every template, worksheet, and guide",
    "Library-only access from $1.90/month",
    "Full membership also includes paid courses",
    "New resources added every month",
    "Cancel any time — no commitment",
  ],
}: Props) {
  const next = encodeURIComponent(returnTo);
  return (
    <div className="kk-fade-up overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-brand-50">
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Members only
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm text-ink/65 sm:text-base">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/membership?next=${next}`}
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Become a member
            </Link>
            <Link
              href={`/signin?next=${next}`}
              className="rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-3 text-xs text-ink/50">
            New here?{" "}
            <Link
              href={`/register?next=${next}&source=library`}
              className="font-semibold text-brand-600 hover:underline"
            >
              Create a free account
            </Link>{" "}
            first, then add membership.
          </p>
        </div>

        <ul className="space-y-3 rounded-2xl border border-ink/10 bg-white p-5">
          {perks.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2 text-sm text-ink/75"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
