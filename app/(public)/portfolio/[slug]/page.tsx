import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchProject,
  fetchProjects,
  fetchServices,
  imageUrl,
} from "@/lib/api";
import CTASection from "@/components/CTASection";
import ContentHTML from "@/components/ContentHTML";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProjectCard from "@/components/ProjectCard";
import ServiceIcon from "@/components/icons/ServiceIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);
  return {
    title: project?.title ?? "Project not found",
    description: project?.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, all, services] = await Promise.all([
    fetchProject(slug),
    fetchProjects(),
    fetchServices(),
  ]);
  if (!project) notFound();

  // Prefer same-category projects when available; fall back to any.
  const cat = (project.category || "").toLowerCase();
  const sameCat = cat
    ? all.filter((p) => p.slug !== project.slug && p.category?.toLowerCase() === cat)
    : [];
  const others = (sameCat.length > 0 ? sameCat : all.filter((p) => p.slug !== project.slug)).slice(0, 3);

  // Related services: those whose title overlaps the project category.
  const relatedServices = cat
    ? services
        .filter((s) =>
          s.title.toLowerCase().includes(cat) || cat.includes(s.title.toLowerCase()),
        )
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-20 pb-8">
      <article className="mx-auto max-w-4xl px-4 pt-16 sm:pt-20">
        <Breadcrumbs
          items={[
            { href: "/portfolio", label: "Portfolio" },
            { label: project.title },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
          {project.category && <span>{project.category}</span>}
          {project.client && (
            <span className="text-ink/40">· {project.client}</span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        {project.summary && (
          <p className="mt-4 text-lg text-ink/70">{project.summary}</p>
        )}

        {project.coverImage && (
           
          <img
            src={imageUrl(project.coverImage)}
            alt={project.title}
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}

        {project.body && <ContentHTML html={project.body} className="mt-8" />}

        {project.results && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Results
            </h2>
            <p className="mt-2 text-base text-brand-800">{project.results}</p>
          </div>
        )}
      </article>

      {/* Related services delivered this project */}
      {relatedServices.length > 0 && (
        <section className="mx-auto max-w-4xl px-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Services that delivered this
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {relatedServices.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-brand-300"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <ServiceIcon title={s.title} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {s.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* More work in this category */}
      {others.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              More work
            </h2>
            <Link
              href="/portfolio"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              All projects →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
