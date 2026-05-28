"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchLibraryResource,
  imageUrl,
  resolveFileURL,
  type LibraryResource,
} from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContentHTML from "@/components/ContentHTML";
import EmptyState from "@/components/EmptyState";
import MemberGateCTA from "@/components/MemberGateCTA";
import { LoadingBlock } from "@/components/Spinner";

function resourceExcerpt(resource: LibraryResource): string {
  return resource.description
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function LibraryResourceDetail({ slug }: { slug: string }) {
  const { user, loading: customerLoading } = useCustomer();
  const [resource, setResource] = useState<LibraryResource | null>(null);
  const [entitled, setEntitled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerLoading) return;
    let cancelled = false;
    setLoading(true);
    fetchLibraryResource(slug, true)
      .then((data) => {
        if (cancelled) return;
        setResource(data.resource);
        setEntitled(data.entitled);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, user, customerLoading]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <LoadingBlock label="Loading resource…" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon="📚"
          title="Resource not found"
          description="This resource may have moved or is no longer published."
          action={{ href: "/library", label: "Back to library" }}
        />
      </div>
    );
  }

  const hasAttachment = Boolean(resource.url && resource.url !== "#");
  const accessHref = hasAttachment ? resolveFileURL(resource.url) : "";
  const excerpt = resourceExcerpt(resource);

  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs
        items={[
          { href: "/library", label: "Library" },
          ...(resource.type
            ? [
                {
                  href: `/library?type=${encodeURIComponent(resource.type)}`,
                  label: resource.type,
                },
              ]
            : []),
          { label: resource.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {resource.type}
            {resource.category && (
              <span className="text-ink/35">· {resource.category}</span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {resource.title}
          </h1>
          {excerpt && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/65">
              {excerpt}
            </p>
          )}
        </div>

        <aside className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
          {resource.image && (
            <img
              src={imageUrl(resource.image)}
              alt={resource.title}
              className="mb-5 aspect-[16/10] w-full rounded-2xl object-cover"
            />
          )}
          {entitled && hasAttachment ? (
            <a
              href={accessHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-brand-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Download / access resource
            </a>
          ) : entitled ? (
            <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
              This resource is a guide you can read directly on this page.
            </div>
          ) : !hasAttachment ? (
            <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
              This resource can be read directly on this page. Membership unlocks
              the full library.
            </div>
          ) : (
            <Link
              href={`/membership?next=${encodeURIComponent(`/library/${resource.slug}`)}`}
              className="block rounded-full bg-brand-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Join to unlock downloads
            </Link>
          )}
          <Link
            href="/library"
            className="mt-3 block rounded-full border border-ink/15 px-5 py-3 text-center text-sm font-semibold text-ink/70 transition hover:bg-ink/5"
          >
            Back to library
          </Link>
        </aside>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ContentHTML html={resource.description} />
        {!entitled && (
          <div className="lg:col-span-2">
            <MemberGateCTA
              returnTo={`/library/${resource.slug}`}
              title={hasAttachment ? "Unlock this resource" : "Unlock the full library"}
              description={
                hasAttachment
                  ? "Join the Kuza Kizazi library to download templates, worksheets, and tools, or read member-only resources as they are published."
                  : "Join the Kuza Kizazi library for every guide, template, worksheet, and tool as new resources are published."
              }
            />
          </div>
        )}
      </div>
    </article>
  );
}
