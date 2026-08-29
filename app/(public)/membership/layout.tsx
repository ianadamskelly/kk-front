import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Join Kuza Kizazi for practical courses, templates, guides, and ongoing creative resources.",
  alternates: { canonical: "/membership" },
};

export default function MembershipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
