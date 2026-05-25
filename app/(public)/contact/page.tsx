import type { Metadata } from "next";
import { fetchSettings, fetchServices } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import ContactIllustration from "@/components/illustrations/ContactIllustration";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Kuza Kizazi — let's turn your idea into a digital reality.",
};

// Tiny inline icons for the contact-method tiles. Kept here rather than
// in BrandIcons.tsx because they're 20×20 with a different stroke weight
// than the rest of the brand glyphs.
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default async function ContactPage() {
  const [settings, services] = await Promise.all([
    fetchSettings(),
    fetchServices(),
  ]);

  const channels = [
    {
      label: "Email",
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
      Icon: MailIcon,
      hint: "Replies within one business day",
    },
    {
      label: "Phone",
      value: settings.contact_phone,
      href: `tel:${settings.contact_phone}`,
      Icon: PhoneIcon,
      hint: "Mon–Fri · 9am–6pm EAT",
    },
    {
      label: "Studio",
      value: settings.contact_address,
      Icon: PinIcon,
      hint: "Walk-ins by appointment",
    },
    {
      label: "Hours",
      value: "Monday – Friday",
      Icon: ClockIcon,
      hint: "09:00 – 18:00 East Africa Time",
    },
  ].filter((d) => d.value);

  return (
    <div className="pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Get in touch"
          title="Let's build something together"
          description="Whether you have a fully-formed idea or just a spark of inspiration, we're here to help you turn it into a digital reality."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Left column: illustration + contact-method tiles */}
          <div className="space-y-6">
            <div className="kk-fade-up overflow-hidden rounded-3xl">
              <ContactIllustration className="h-auto w-full" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map(({ label, value, href, Icon, hint }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-ink/10 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-0.5 block break-words text-sm font-medium text-ink hover:text-brand-600"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 break-words text-sm font-medium text-ink">
                          {value}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-ink/50">{hint}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: the actual form */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
            <ContactForm services={services.map((s) => s.title)} />
          </div>
        </div>
      </section>
    </div>
  );
}
