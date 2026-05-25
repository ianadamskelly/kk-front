import Link from "next/link";
import { SITE_NAME, type Service, type SiteSettings } from "@/lib/api";

// Small inline SVGs so the footer doesn't pull in an icon library for
// the half-dozen glyphs it needs. All sized to 16px and inherit
// currentColor so brand-tinted versions just work.
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m3 7 9 6 9-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H7.7v3.1h2.7V22h3.1z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.965 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.65-1.86 3.39-1.86 3.63 0 4.3 2.39 4.3 5.49v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

// SOCIALS is rendered in this fixed order so the icons stay stable as
// the admin toggles individual links on/off via /admin/settings.
const SOCIALS = [
  { key: "social_facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "social_instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "social_twitter", label: "X / Twitter", Icon: TwitterIcon },
  { key: "social_linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

// Quick links — the items we pulled out of the primary nav, plus
// secondary destinations a visitor might want to jump to from anywhere
// on the site. Order roughly: most-likely first.
const QUICK_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/about", label: "About" },
  { href: "/about#faq", label: "FAQ" },
  { href: "/insights", label: "Insights" },
];

export default function SiteFooter({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  const year = new Date().getFullYear();
  const description =
    settings.footer_description ||
    settings.tagline ||
    "Unleashing creativity, empowering possibilities.";
  // Take up to 4 services for the column. The admin can re-order them
  // via /admin/services if a different set should bubble up.
  const featured = services.slice(0, 4);

  return (
    <footer className="mt-24 bg-[#0b1530] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* Top: 4-column grid. Contact sits in the last cell on desktop
            so it lands on the far right. */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand + description + social */}
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
              {SITE_NAME}
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {description}
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.filter((s) => settings[s.key]).map(
                ({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-brand-500 hover:text-white"
                  >
                    <Icon />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Services */}
          <FooterColumn title="Services">
            {featured.length > 0 ? (
              featured.map((s) => (
                <FooterLink key={s.id} href={`/services/${s.slug}`}>
                  {s.title}
                </FooterLink>
              ))
            ) : (
              <>
                <FooterLink href="/services">Graphic Design</FooterLink>
                <FooterLink href="/services">Web Development</FooterLink>
                <FooterLink href="/services">Animation &amp; Video</FooterLink>
                <FooterLink href="/services">Digital Marketing</FooterLink>
              </>
            )}
          </FooterColumn>

          {/* Quick links — secondary destinations not in the top nav */}
          <FooterColumn title="Quick links">
            {QUICK_LINKS.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Contact (far right) */}
          <FooterColumn title="Contact">
            {settings.contact_address && (
              <ContactRow icon={<PinIcon />}>
                {settings.contact_address}
              </ContactRow>
            )}
            {settings.contact_phone && (
              <ContactRow icon={<PhoneIcon />}>
                <a
                  href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  {settings.contact_phone}
                </a>
              </ContactRow>
            )}
            {settings.contact_email && (
              <ContactRow icon={<MailIcon />}>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="hover:text-white"
                >
                  {settings.contact_email}
                </a>
              </ContactRow>
            )}
          </FooterColumn>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row">
          <span>
            © {year} {SITE_NAME}. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-white/65">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="transition hover:text-brand-400">
        {children}
      </Link>
    </li>
  );
}

function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-brand-500">{icon}</span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
