"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { customerFetch } from "@/lib/customer";
import { buildBrandClarityWorksheetHTML } from "@/components/worksheet/brandClarityWorksheetTemplate";
import { buildIdealCustomerProfileTemplateHTML } from "@/components/worksheet/idealCustomerProfileTemplate";

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
    () => {
      const input = {
        logoSrc: "/logo-wordmark.svg",
        storageNamespace:
          entitlement.assetSlug === "ideal-customer-profile-template"
            ? `kkk-icp:${userId}:${entitlement.licenseId}:`
            : `kkk-bcw:${userId}:${entitlement.licenseId}:`,
        watermarkText,
      };
      if (entitlement.assetSlug === "ideal-customer-profile-template") {
        return buildIdealCustomerProfileTemplateHTML(input);
      }
      return buildBrandClarityWorksheetHTML(input);
    },
    [entitlement.assetSlug, entitlement.licenseId, userId, watermarkText],
  );

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const requestType = event.data?.type;
      if (
        requestType !== "kkk-bcw-export-request" &&
        requestType !== "kkk-interactive-asset-export-request"
      ) {
        return;
      }
      const approvedType =
        requestType === "kkk-bcw-export-request"
          ? "kkk-bcw-print-approved"
          : "kkk-interactive-asset-print-approved";
      const deniedType =
        requestType === "kkk-bcw-export-request"
          ? "kkk-bcw-print-denied"
          : "kkk-interactive-asset-print-denied";

      if (usesRemaining <= 0) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: deniedType,
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
          { type: approvedType, usesRemaining: remaining },
          "*",
        );
      } catch (e) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: deniedType,
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
        title={entitlement.assetName}
        srcDoc={srcDoc}
        className="h-[calc(100vh-180px)] min-h-[720px] w-full border-0 bg-[#efe9df]"
        sandbox="allow-scripts allow-same-origin allow-modals"
      />
    </div>
  );
}
