import Link from "next/link";
import cases from "@/lib/anonymous-work.json";
export type AnonymousWork = (typeof cases)[number];

export default function AnonymousCase({ project, detail = false }: { project: AnonymousWork; detail?: boolean }) {
  const Heading = detail ? "h1" : "h2";
  return <article id={project.slug} className="grid scroll-mt-8 gap-8 border-t border-ink/10 py-12 md:grid-cols-[1.13fr_1fr] md:gap-12">
    <figure className="m-0">
      {/* Plain image keeps the portable public assets independent of external optimisation. */}
      <img src={`/images/anonymous-work/${project.image}`} alt={project.caption} className="h-auto w-full rounded-2xl" loading={detail ? "eager" : "lazy"} />
      <figcaption className="mt-3 text-sm leading-relaxed text-ink/70">{project.caption}</figcaption>
      {project.demoUrl && <p className="mt-4"><a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline underline-offset-4">Explore the library demo ↗</a></p>}
    </figure>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">{project.category}</p>
      <Heading className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{project.title}</Heading>
      <p className="mt-4 text-xl leading-relaxed text-ink/70">{project.summary}</p>
      <h3 className="mt-6 text-lg font-semibold">The brief</h3><p className="mt-2 leading-relaxed">{project.problem}</p>
      <h3 className="mt-6 text-lg font-semibold">Our work</h3><p className="mt-2 leading-relaxed">{project.work}</p>
      <h3 className="mt-6 text-lg font-semibold">The handoff</h3><p className="mt-2 leading-relaxed">{project.handoff}</p>
      <p className="mt-4 text-sm text-ink/70">Project duration: {project.duration}</p>
      <details className="my-5"><summary className="cursor-pointer py-2 font-semibold text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4">Project notes</summary><p className="mt-2 text-sm leading-relaxed text-ink/70">{project.boundary}</p></details>
      {!detail && <Link href={`/portfolio/${project.slug}`} className="mr-5 inline-block py-2 font-semibold text-brand-600 underline underline-offset-4">View case study</Link>}
      <Link href={`/contact?project=${encodeURIComponent(project.slug)}`} className="inline-block py-2 font-semibold text-brand-600 underline underline-offset-4">Discuss a similar project →</Link>
    </div>
  </article>;
}
