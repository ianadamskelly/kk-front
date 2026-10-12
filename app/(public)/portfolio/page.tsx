import type { Metadata } from "next";
import Link from "next/link";
import cases from "@/lib/anonymous-work.json";
import AnonymousCase from "@/components/AnonymousCase";
export const metadata: Metadata = { title: "Selected work", description: "Anonymous case studies in software, presentations, websites and school systems from Kuza Kizazi Kreative.", alternates: { canonical: "/portfolio" } };
export default function PortfolioPage() {
  return <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pt-20">
    <section className="max-w-4xl pb-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">Selected work · clients kept anonymous</p>
      <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">Real briefs.<br />Thoughtful work.</h1>
      <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70">From connecting codebases to preparing a staff training session, here is how we approach the work—and what we hand over.</p>
      <Link href="/contact" className="mt-7 inline-block rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4">Tell us what you need</Link>
    </section>
    {cases.map(project => <AnonymousCase key={project.slug} project={project} />)}
    <section className="mt-10 rounded-3xl bg-ink p-8 text-white sm:p-12"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bring the task. We’ll help shape the scope.</h2><p className="mt-4 max-w-2xl text-lg leading-relaxed">Send the deliverable you need, the files or tools involved and your deadline. We’ll confirm fit, scope and a quote before work starts.</p><a href="https://wa.me/252684638671" className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-3 font-semibold">Discuss it on WhatsApp</a></section>
    <p className="mt-8 text-sm leading-relaxed text-ink/70">Client names and identifying details are withheld. Review sites and recreated visuals are labelled. Every project is scoped individually.</p>
  </div>;
}
