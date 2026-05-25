import Link from "next/link";
import { Project, imageUrl } from "@/lib/api";

export default function ProjectCard({ project }: { project: Project }) {
  const href = `/portfolio/${project.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="aspect-[16/10] w-full overflow-hidden bg-ink/5">
          {project.coverImage ? (
             
            <img
              src={imageUrl(project.coverImage)}
              alt={project.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
              <span className="text-4xl font-semibold text-brand-300">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
          {project.category || "Project"}
          {project.client && <span className="text-ink/40">· {project.client}</span>}
        </div>
        <h3 className="text-lg font-semibold leading-snug text-ink">
          <Link href={href} className="hover:text-brand-600">
            {project.title}
          </Link>
        </h3>
        {project.summary && (
          <p className="line-clamp-2 text-sm text-ink/60">{project.summary}</p>
        )}
        <Link
          href={href}
          className="mt-auto pt-2 text-sm font-semibold text-brand-600 hover:underline"
        >
          View case study →
        </Link>
      </div>
    </article>
  );
}
