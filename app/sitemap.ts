import type { MetadataRoute } from "next";
import {
  SITE_URL,
  fetchPosts,
  fetchProducts,
  fetchCourses,
  fetchServices,
  fetchProjects,
} from "@/lib/api";

// Revalidate the sitemap every hour. Worth more than the cache-hit
// savings: if a brand new blog post can't be discovered for an hour
// after publishing, that's fine.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const STATIC_PATHS: { path: string; priority: number; freq: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/services", priority: 0.8, freq: "weekly" },
  { path: "/portfolio", priority: 0.8, freq: "weekly" },
  { path: "/insights", priority: 0.8, freq: "daily" },
  { path: "/courses", priority: 0.8, freq: "weekly" },
  { path: "/shop", priority: 0.8, freq: "weekly" },
  { path: "/library", priority: 0.6, freq: "weekly" },
  { path: "/membership", priority: 0.7, freq: "monthly" },
  { path: "/contact", priority: 0.6, freq: "monthly" },
  { path: "/privacy", priority: 0.2, freq: "yearly" },
  { path: "/terms", priority: 0.2, freq: "yearly" },
];

// safe wraps a fetcher so one upstream blip can't poison the whole
// sitemap response. Logs and falls back to an empty list.
async function safe<T>(promise: Promise<T>, label: string): Promise<T | []> {
  try {
    return await promise;
  } catch (err) {
    console.error(`sitemap: ${label} fetch failed`, err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [posts, products, courses, services, projects] = await Promise.all([
    safe(fetchPosts({ perPage: 200 }), "posts"),
    safe(fetchProducts({}), "products"),
    safe(fetchCourses(), "courses"),
    safe(fetchServices(), "services"),
    safe(fetchProjects(), "projects"),
  ]);

  const entries: Entry[] = [];

  for (const s of STATIC_PATHS) {
    entries.push({
      url: `${SITE_URL}${s.path}`,
      lastModified: now,
      changeFrequency: s.freq,
      priority: s.priority,
    });
  }

  const postList = Array.isArray(posts) ? [] : posts.posts || [];
  for (const p of postList) {
    entries.push({
      url: `${SITE_URL}/insights/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const p of products as Awaited<ReturnType<typeof fetchProducts>>) {
    if (p.status !== "published") continue;
    entries.push({
      url: `${SITE_URL}/shop/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const c of courses as Awaited<ReturnType<typeof fetchCourses>>) {
    if (c.status !== "published") continue;
    entries.push({
      url: `${SITE_URL}/courses/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const s of services as Awaited<ReturnType<typeof fetchServices>>) {
    entries.push({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const p of projects as Awaited<ReturnType<typeof fetchProjects>>) {
    entries.push({
      url: `${SITE_URL}/portfolio/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
