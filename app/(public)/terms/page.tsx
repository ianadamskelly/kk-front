import type { Metadata } from "next";

// Placeholder terms of service. The page exists so the footer link
// resolves; replace this copy with your legal team's vetted version.

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules of engagement for using the Kuza Kizazi website, courses, shop, and membership.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        Legal
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="kk-prose mt-10">
        <p>
          By using the Kuza Kizazi website you agree to the following.
          We&apos;ve tried to keep these terms plain — if anything is
          unclear, reach out before you sign up.
        </p>

        <h2>Your account</h2>
        <p>
          You&apos;re responsible for keeping your account credentials
          secure. Don&apos;t share your password. If you suspect
          unauthorised access, change your password and open a ticket so
          we can help.
        </p>

        <h2>Purchases</h2>
        <p>
          Prices are shown in Kenyan shillings unless stated otherwise.
          Membership is billed manually — each payment extends your
          membership by 30 days. We don&apos;t auto-charge your card.
          Course and shop purchases are final once delivered; for any
          issues open a support ticket and we&apos;ll work it out.
        </p>

        <h2>Content</h2>
        <p>
          Course materials and library resources are for your personal
          use. Don&apos;t redistribute, resell, or share them publicly.
          User-generated content (testimonials, comments) remains yours,
          but you grant us a non-exclusive licence to display it.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Don&apos;t use the site to break the law, harass people, or
          interfere with the service. We reserve the right to suspend or
          terminate accounts that violate these terms.
        </p>

        <h2>Liability</h2>
        <p>
          Our liability is limited to the amount you&apos;ve paid us in
          the last 12 months. The site is provided &ldquo;as is&rdquo; —
          we do our best to keep it running, but can&apos;t guarantee
          uninterrupted service.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms occasionally. If a change is
          significant we&apos;ll let active customers know by email.
        </p>
      </div>
    </article>
  );
}
