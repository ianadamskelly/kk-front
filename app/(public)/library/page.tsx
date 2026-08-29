import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import LibraryGrid from "@/components/LibraryGrid";

export const metadata: Metadata = {
  title: "Resource Library",
  description:
    "A growing library of templates, guides, and tools for Kuza Kizazi members. Become a member to unlock every resource.",
  alternates: { canonical: "/library" },
};

// The library is members-only. The page itself stays publicly indexable
// (titles + descriptions are visible) so search engines see the catalogue
// and non-members get a clear preview of what's behind the gate — but
// the actual download URLs are redacted server-side until membership is
// verified.
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const initialType = typeof sp.type === "string" ? sp.type : "";

  return (
    <div className="pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Library"
          title="Guides, templates &amp; tools"
          description="An exclusive library of resources to help you build a stronger brand and business — included with every Kuza Kizazi membership."
        />

        <div className="mt-10">
          <LibraryGrid initialType={initialType} />
        </div>
      </section>
    </div>
  );
}
