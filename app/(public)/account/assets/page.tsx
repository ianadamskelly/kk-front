"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";
import { customerFetch, useCustomer } from "@/lib/customer";
import { formatDate } from "@/lib/api";

interface InteractiveAsset {
  id: number;
  assetSlug: string;
  assetName: string;
  licenseId: string;
  usesRemaining: number;
  expiresAt: string | null;
  status: string;
  createdAt: string;
}

export default function AccountAssetsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [items, setItems] = useState<InteractiveAsset[] | null>(null);

  useEffect(() => {
    if (!user) return;
    customerFetch("/api/account/assets")
      .then(async (res) => (res.ok ? ((await res.json()) as InteractiveAsset[]) : []))
      .then(setItems)
      .catch(() => setItems([]));
  }, [user]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My tools</h1>
        <p className="mt-1 text-sm text-ink/55">
          Interactive resources unlocked from your confirmed purchases.
        </p>
      </header>

      {items === null ? (
        <SkeletonTableRows rows={3} columns={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="✍️"
          title="No tools yet"
          description="When you buy an interactive worksheet or tool, it will appear here."
          action={{ href: "/shop", label: "Visit the shop" }}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-ink">{item.assetName}</p>
                <p className="mt-0.5 text-xs text-ink/55">
                  License {item.licenseId} · Unlocked {formatDate(item.createdAt)}
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  {item.usesRemaining} PDF export
                  {item.usesRemaining === 1 ? "" : "s"} remaining
                  {item.expiresAt ? ` · Expires ${formatDate(item.expiresAt)}` : ""}
                </p>
              </div>
              <Link
                href={`/account/assets/${item.assetSlug}`}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
