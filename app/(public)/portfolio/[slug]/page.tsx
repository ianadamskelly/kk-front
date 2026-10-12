import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import cases from "@/lib/anonymous-work.json";
import AnonymousCase from "@/components/AnonymousCase";
export function generateStaticParams() { return cases.map(({slug}) => ({slug})); }
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const {slug} = await params; const project = cases.find(x => x.slug === slug);
  return { title: project?.title ?? "Project not found", description: project?.summary, alternates: project ? {canonical: `/portfolio/${slug}`} : undefined };
}
export default async function WorkDetail({params}: {params: Promise<{slug:string}>}) {
  const {slug} = await params; const project = cases.find(x => x.slug === slug); if (!project) notFound();
  return <div className="mx-auto max-w-6xl px-5 py-12"><Link href="/portfolio" className="font-semibold text-brand-600 underline underline-offset-4">← Selected work</Link><AnonymousCase project={project} detail /><p className="text-sm text-ink/70">Client identity withheld. Review sites and recreated visuals are labelled. Every project is scoped individually.</p></div>;
}
