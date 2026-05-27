"use client";

import AccountShell from "@/components/account/AccountShell";
import ReferralsCard from "@/components/account/ReferralsCard";
import CreditCard from "@/components/account/CreditCard";
import { useCustomer } from "@/lib/customer";

// Standalone /account/rewards page that hosts the existing referral +
// credit cards. The dashboard summary surfaces credit balance only;
// users come here for the full ledger + share link.
export default function AccountRewardsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Referrals &amp; credit
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Share your link, earn store credit, and spend it at checkout.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <ReferralsCard />
        <CreditCard />
      </div>
    </div>
  );
}
