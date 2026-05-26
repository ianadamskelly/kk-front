import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/api";

// robots.ts uses the Next 16 file convention. It generates the
// /robots.txt response from this Route Handler at build time.
//
// Disallow the customer account area and the admin tree — those
// pages aren't useful for indexing and we'd rather not feed them
// to search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
