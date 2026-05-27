"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SITE_NAME } from "@/lib/api";
import { useAdminSession } from "@/lib/adminSession";
import { useTheme } from "@/lib/theme";
import ThemeToggle from "@/components/ThemeToggle";

type NavLink = {
  href: string;
  label: string;
  // Permission(s) needed to see this link. `null` means "everyone with admin
  // access" — e.g. the dashboard itself. Array means OR.
  perm: string | string[] | null;
};

const NAV_GROUPS: { label: string; links: NavLink[] }[] = [
  {
    label: "Content",
    links: [
      { href: "/admin", label: "Dashboard", perm: null },
      { href: "/admin/posts", label: "Insights / Posts", perm: "posts.view" },
      { href: "/admin/categories", label: "Categories", perm: "categories.manage" },
      { href: "/admin/comments", label: "Comments", perm: "comments.view" },
      { href: "/admin/reviews", label: "Reviews", perm: "comments.view" },
    ],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/services", label: "Services", perm: "services.view" },
      { href: "/admin/projects", label: "Projects", perm: "projects.view" },
      { href: "/admin/team", label: "Team", perm: "team.view" },
      { href: "/admin/testimonials", label: "Testimonials", perm: "testimonials.view" },
      { href: "/admin/stats", label: "Stats", perm: "stats.view" },
      { href: "/admin/settings", label: "Settings", perm: "settings.view" },
    ],
  },
  {
    label: "Shop",
    links: [
      { href: "/admin/products", label: "Products", perm: "products.view" },
      { href: "/admin/orders", label: "Orders", perm: "orders.view" },
    ],
  },
  {
    label: "Learn",
    links: [
      { href: "/admin/courses", label: "Courses", perm: "courses.view" },
      { href: "/admin/library", label: "Library", perm: "library.view" },
      { href: "/admin/memberships", label: "Members", perm: "memberships.view" },
    ],
  },
  {
    label: "Revenue",
    links: [
      { href: "/admin/revenue", label: "Overview", perm: ["orders.view", "service_revenue.view", "memberships.view"] },
      { href: "/admin/service-revenue", label: "Service income", perm: "service_revenue.view" },
      { href: "/admin/coupons", label: "Coupons", perm: "coupons.view" },
      { href: "/admin/rewards", label: "Referrals & credit", perm: "rewards.view" },
    ],
  },
  {
    label: "Marketing",
    links: [
      { href: "/admin/newsletters", label: "Newsletters", perm: "newsletters.view" },
      { href: "/admin/subscribers", label: "Subscribers", perm: "subscribers.view" },
    ],
  },
  {
    label: "Inbox",
    links: [
      { href: "/admin/submissions", label: "Contact messages", perm: "submissions.view" },
      { href: "/admin/tickets", label: "Support tickets", perm: "tickets.view" },
    ],
  },
  {
    label: "Team & access",
    links: [
      { href: "/admin/users", label: "Staff users", perm: "users.view" },
      { href: "/admin/roles", label: "Roles & permissions", perm: "roles.view" },
    ],
  },
];

// AdminShell guards admin pages and renders the navigation around the page
// content. Each menu item is filtered by the signed-in user's permissions.
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAdminSession();
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-ink/50">
        Loading&hellip;
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const userPerms = new Set(user.permissions);
  const canSee = (perm: NavLink["perm"]) => {
    if (perm == null) return true;
    const wanted = Array.isArray(perm) ? perm : [perm];
    return wanted.some((p) => userPerms.has(p));
  };

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    links: g.links.filter((l) => canSee(l.perm)),
  })).filter((g) => g.links.length > 0);

  // Find the most specific NAV entry that matches the current path. If the
  // signed-in user can't see it, render a friendly forbidden message instead
  // of letting the page hit the API and 403.
  const allLinks = NAV_GROUPS.flatMap((g) => g.links);
  const matchedLink = allLinks
    .filter((l) => isActive(l.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const pathAllowed = !matchedLink || canSee(matchedLink.perm);

  const logout = async () => {
    // signOut now hits POST /api/auth/logout to clear the HttpOnly
    // cookie. Await it so the user lands on /admin/login with a
    // clean cookie state — otherwise the redirect could fire
    // before the cookie is gone and an instant refresh would
    // briefly look like they were still signed in.
    await signOut();
    router.replace("/admin/login");
  };

  return (
    // Lock the shell to the viewport height so the header, nav and
    // main pane can scroll independently. The page wrapper (in
    // app/admin/layout.tsx → root layout) gives us the full height to
    // work with; h-screen pins us there.
    <div className={`grid h-screen grid-rows-[auto_1fr] grid-cols-[15rem_1fr] bg-cream text-ink ${theme === "dark" ? "kk-dark" : ""}`}>
      {/* Top bar — full width, sticky by virtue of being grid row 0. */}
      <header className="col-span-2 flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span>{SITE_NAME} CMS</span>
          <span className="ml-2 hidden text-xs font-normal text-ink/45 sm:inline">
            {user.name}{" "}
            <span className="ml-1 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
              {user.roleName || user.role}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink/70 hover:border-brand-400 hover:text-ink"
          >
            View site ↗
          </Link>
          <button
            onClick={logout}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Left rail — independent scroll. */}
      <aside className="overflow-y-auto border-r border-ink/10 bg-white">
        <nav className="flex flex-col gap-5 px-4 py-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-xs font-semibold uppercase tracking-widest text-ink/35">
                {group.label}
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-md px-3 py-1.5 text-sm font-medium ${
                      isActive(link.href)
                        ? "bg-brand-500 text-white"
                        : "text-ink/60 hover:bg-ink/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main pane — independent scroll. */}
      <main className="overflow-y-auto overflow-x-hidden">
        {pathAllowed ? (
          children
        ) : (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Not authorised
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              You don&apos;t have access to this page
            </h1>
            <p className="mt-3 text-sm text-ink/55">
              Your role (
              <span className="font-medium text-ink/80">
                {user.roleName || user.role}
              </span>
              ) doesn&apos;t include this section. Ask an admin to update your
              permissions.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Back to dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
