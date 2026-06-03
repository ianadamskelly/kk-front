"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { customerFetch } from "@/lib/customer";
import { buildBrandClarityWorksheetHTML } from "@/components/worksheet/brandClarityWorksheetTemplate";

interface Entitlement {
  id: number;
  assetSlug: string;
  assetName: string;
  licenseId: string;
  usesRemaining: number;
}

interface Props {
  entitlement: Entitlement;
  userId: number;
  userEmail: string;
}

export default function BrandClarityWorksheet({
  entitlement,
  userId,
  userEmail,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [usesRemaining, setUsesRemaining] = useState(entitlement.usesRemaining);

  const watermarkText = `${userEmail} · ${entitlement.licenseId}`;
  const srcDoc = useMemo(
    () =>
      buildBrandClarityWorksheetHTML({
        logoSrc: "/logo-wordmark.svg",
        storageNamespace: `kkk-bcw:${userId}:${entitlement.licenseId}:`,
        watermarkText,
      }),
    [entitlement.licenseId, userId, watermarkText],
  );

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== "kkk-bcw-export-request") return;

      if (usesRemaining <= 0) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "kkk-bcw-print-denied",
            error: "You have reached the export limit for this worksheet.",
            usesRemaining: 0,
          },
          "*",
        );
        return;
      }

      try {
        const res = await customerFetch(
          `/api/account/assets/${entitlement.assetSlug}/export`,
          { method: "POST" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Export was not approved.");
        const remaining = data.entitlement.usesRemaining as number;
        setUsesRemaining(remaining);
        iframeRef.current?.contentWindow?.postMessage(
          { type: "kkk-bcw-print-approved", usesRemaining: remaining },
          "*",
        );
      } catch (e) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "kkk-bcw-print-denied",
            error: e instanceof Error ? e.message : "Export failed.",
            usesRemaining,
          },
          "*",
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [entitlement.assetSlug, usesRemaining]);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white px-4 py-3 text-xs text-ink/55">
        <span>
          Licensed to {userEmail} · {entitlement.licenseId}
        </span>
        <span className="font-semibold text-ink">
          {usesRemaining} PDF export{usesRemaining === 1 ? "" : "s"} remaining
        </span>
      </div>
      <iframe
        ref={iframeRef}
        title="Brand Clarity Worksheet"
        srcDoc={srcDoc}
        className="h-[calc(100vh-180px)] min-h-[720px] w-full border-0 bg-[#efe9df]"
        sandbox="allow-scripts allow-same-origin allow-modals"
      />
    </div>
  );
}
