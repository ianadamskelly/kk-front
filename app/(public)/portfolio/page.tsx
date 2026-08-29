import type { Metadata } from "next";
import { fetchProjects } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected case studies from Kuza Kizazi — branding, platforms, and digital experiences.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const projects = await fetchProjects();

  return (
    <div className="space-y-20 pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Our best work"
          title="Crafting digital experiences that push boundaries"
          description="A look at the brands and products we've helped bring to life."
        />
        {projects.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink/50">
            Case studies are on the way — check back soon.
          </p>
        )}
      </section>

      <CTASection
        title="Have a vision for your next project?"
        description="Let's turn it into work worth showing off."
      />
    </div>
  );
}
