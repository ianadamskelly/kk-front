"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { AdminSessionProvider } from "@/lib/adminSession";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The login page must render without the auth guard.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
