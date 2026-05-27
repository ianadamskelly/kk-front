"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchLibrary,
  type LibraryListing,
  type LibraryResource,
} from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import LibraryCard from "@/components/LibraryCard";
import MemberGateCTA from "@/components/MemberGateCTA";
import EmptyState from "@/components/EmptyState";
import { SkeletonCards } from "@/components/Skeleton";
import FadeIn from "@/components/FadeIn";

function chipClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm transition ${
    active
      ? "border-brand-500 bg-brand-500 text-white"
      : "border-ink/15 text-ink/60 hover:border-brand-400 hover:text-ink"
  }`;
}

// LibraryGrid handles the auth-aware fetch + render of the resource
// library. Non-members see the full catalogue but with locked URLs; an
// upgrade CTA sits at the top so the gate is impossible to miss.
export default function LibraryGrid({ initialType }: { initialType: string }) {
  const { user, loading: customerLoading } = useCustomer();
  const [listing, setListing] = useState<LibraryListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(initialType);

  useEffect(() => {
    // Wait until the customer session has resolved so the request
    // carries the user's cookie. Otherwise the first paint runs
    // anonymous and would lock the page for an actual member.
    if (customerLoading) return;
    let cancelled = false;
    fetchLibrary().then((data) => {
      if (!cancelled) {
        setListing(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, customerLoading]);

  const resources = listing?.resources ?? [];
  const entitled = listing?.entitled ?? false;

  const types = useMemo(() => {
    return [...new Set(resources.map((r) => r.type).filter(Boolean))];
  }, [resources]);

  const filtered = useMemo(
    () => (type ? resources.filter((r) => r.type === type) : resources),
    [resources, type],
  );

  return (
    <div className="space-y-10">
      {/* Member gate — only shown to non-entitled visitors. */}
      {!loading && !entitled && <MemberGateCTA />}

      {/* Type filter chips. */}
      {types.length > 0 && !loading && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setType("")}
            className={chipClass(!type)}
          >
            All types
          </button>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={chipClass(type === t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Catalogue. */}
      {loading ? (
        <SkeletonCards count={6} columns={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={type ? "🔍" : "📚"}
          title={type ? "No resources match this filter" : "Library is being stocked"}
          description={
            type
              ? "Try clearing the filter or pick another type."
              : "Fresh templates and guides are on the way."
          }
          action={type ? { onClick: () => setType(""), label: "Clear filter" } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <FadeIn key={r.id} delay={Math.min(i, 5) * 40}>
              <LibraryCard resource={r} locked={!entitled} />
            </FadeIn>
          ))}
        </div>
      )}

      {/* Footer reminder for non-members at the bottom of long lists. */}
      {!loading && !entitled && filtered.length > 6 && (
        <div className="rounded-2xl border border-ink/10 bg-white p-6 text-center text-sm text-ink/65">
          {filtered.length} resources locked.{" "}
          <Link
            href="/membership?next=/library"
            className="font-semibold text-brand-600 hover:underline"
          >
            Become a member to unlock them all →
          </Link>
        </div>
      )}
    </div>
  );
}

// LibraryResource is re-exported so the wrapper page can keep its types
// tidy without re-importing from @/lib/api directly.
export type { LibraryResource };
