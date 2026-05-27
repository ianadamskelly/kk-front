"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, formatDate } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface DownloadFile {
  downloadId: number;
  /** Server-signed path, e.g. "/api/downloads/<jwt>". Prefix with API_URL. */
  url: string;
  label: string;
  sizeBytes: number;
  downloadsUsed: number;
  maxDownloads: number | null;
  downloadsRemaining: number | null;
}

interface Download {
  orderId: number;
  productId: number | null;
  productName: string;
  quantity: number;
  purchasedAt: string;
  files: DownloadFile[];
}

function formatBytes(n: number): string {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// "My Downloads" lists products from confirmed/fulfilled shop orders so
// the customer can find their purchases without scrolling through the
// orders list. Future-proofed for digital products: when a product has
// downloadable files attached, the link will resolve to those.
export default function AccountDownloadsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [items, setItems] = useState<Download[] | null>(null);

  useEffect(() => {
    if (!user) return;
    customerFetch(`/api/account/downloads`)
      .then(async (r) => (r.ok ? ((await r.json()) as Download[]) : []))
      .then(setItems);
  }, [user]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My downloads</h1>
        <p className="mt-1 text-sm text-ink/55">
          Products and digital resources from your confirmed orders.
        </p>
      </header>

      {items === null ? (
        <SkeletonTableRows rows={4} columns={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="⬇️"
          title="No downloads yet"
          description="When you buy a product or digital resource, it'll appear here for quick access."
          action={{ href: "/shop", label: "Visit the shop" }}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((d, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/[0.06] px-5 py-4">
                <div>
                  <p className="font-semibold text-ink">
                    {d.productName}
                    {d.quantity > 1 && (
                      <span className="ml-1 text-xs font-normal text-ink/45">
                        × {d.quantity}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/55">
                    Purchased {formatDate(d.purchasedAt)}
                  </p>
                </div>
                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Order #{d.orderId} →
                </Link>
              </div>
              {d.files.length === 0 ? (
                <p className="px-5 py-4 text-sm text-ink/45">
                  No downloadable files attached. If you expected files
                  here, contact support.
                </p>
              ) : (
                <ul className="divide-y divide-ink/[0.06]">
                  {d.files.map((f) => (
                    <li
                      key={f.downloadId}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {f.label}
                        </p>
                        <p className="text-xs text-ink/55">
                          {formatBytes(f.sizeBytes)}
                          {f.maxDownloads != null && (
                            <span className="ml-2">
                              · {f.downloadsRemaining} of {f.maxDownloads}{" "}
                              download{f.maxDownloads === 1 ? "" : "s"} left
                            </span>
                          )}
                        </p>
                      </div>
                      {f.maxDownloads != null && f.downloadsRemaining === 0 ? (
                        <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs text-ink/45">
                          Limit reached
                        </span>
                      ) : (
                        <a
                          href={`${API_URL}${f.url}`}
                          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                        >
                          ⬇ Download
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
