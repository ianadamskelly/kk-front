"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import { LoadingBlock } from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import BrandClarityWorksheet from "@/components/worksheet/BrandClarityWorksheet";
import { customerFetch, useCustomer } from "@/lib/customer";

const SUPPORTED_ASSETS = new Set([
  "brand-clarity-worksheet",
  "ideal-customer-profile-template",
]);

interface Entitlement {
  id: number;
  assetSlug: string;
  assetName: string;
  licenseId: string;
  usesRemaining: number;
}

interface AssetDetail {
  entitlement: Entitlement;
  assetSessionToken: string;
  assetSessionExpiresAt: string;
  watermark: {
    email: string;
    licenseId: string;
  };
}

export default function AccountAssetPage() {
  const params = useParams<{ assetId: string }>();
  const assetId = params.assetId;

  return (
    <AccountShell>
      {SUPPORTED_ASSETS.has(assetId) ? (
        <Body assetId={assetId} />
      ) : (
        <EmptyState
          icon="🔎"
          title="Tool not found"
          description="This interactive resource is not available."
          action={{ href: "/account/assets", label: "Back to My Tools" }}
        />
      )}
    </AccountShell>
  );
}

function Body({ assetId }: { assetId: string }) {
  const { user } = useCustomer();
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    customerFetch(`/api/account/assets/${assetId}`)
      .then(async (res) => {
        if (!res.ok) {
          setDenied(true);
          return null;
        }
        return (await res.json()) as AssetDetail;
      })
      .then((data) => {
        if (data) setDetail(data);
      })
      .catch(() => setDenied(true));
  }, [assetId, user]);

  if (denied) {
    return (
      <EmptyState
        icon="🔒"
        title="This tool is locked"
        description="Buy the worksheet from the shop, then return here from My Tools after the order is confirmed."
        action={{ href: `/shop/${assetId}`, label: "View product" }}
      />
    );
  }

  if (!detail || !user) {
    return <LoadingBlock label="Checking your worksheet access…" />;
  }

  return (
    <BrandClarityWorksheet
      entitlement={detail.entitlement}
      userId={user.id}
      userEmail={detail.watermark.email}
    />
  );
}
