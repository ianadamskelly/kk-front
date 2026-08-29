import type { Metadata } from "next";

// Placeholder privacy policy. The page is intentionally generic so the
// footer link resolves; replace this copy with your legal team's vetted
// version (or move it under /admin/settings as a CMS-managed body).

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Kuza Kizazi collects, uses, and protects the personal information you share with us.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        Legal
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Privacy Policy
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
          This page describes what data we collect when you use the Kuza
          Kizazi website, what we do with it, and the choices you have
          about it. We keep things short on purpose — if anything is
          unclear, get in touch and we&apos;ll explain.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details</strong> — name and email when you
            create an account; phone and shipping address when you save
            them for checkout.
          </li>
          <li>
            <strong>Orders &amp; payments</strong> — what you bought, the
            amount, and an opaque token from the payment gateway so we can
            verify the transaction. We never store full card numbers.
          </li>
          <li>
            <strong>Usage</strong> — basic server logs (IP, browser,
            timestamps) for security and abuse prevention.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To deliver the courses, products, and memberships you buy.</li>
          <li>To send transactional email (order confirmations, password resets, ticket replies).</li>
          <li>To send newsletters — only to addresses on the mailing list, with one-click unsubscribe in every email.</li>
        </ul>

        <h2>Your choices</h2>
        <ul>
          <li>Edit or remove your account details from your profile settings any time.</li>
          <li>Unsubscribe from newsletters via the link in any email footer.</li>
          <li>Request a copy or deletion of your data by opening a ticket from your account dashboard.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:info@kuzakizazi.com">info@kuzakizazi.com</a> or
          raise a ticket from your account.
        </p>
      </div>
    </article>
  );
}
