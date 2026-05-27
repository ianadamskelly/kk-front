import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build output for Docker/Coolify deploys.
  output: "standalone",
  // Pin the workspace root to this folder so Next.js does not pick up an
  // unrelated lockfile elsewhere on the machine.
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      { source: "/about-us/:path*", destination: "/about", permanent: true },
      { source: "/projects/:path*", destination: "/portfolio", permanent: true },
      {
        source: "/products/when-it-all-goes-wrong",
        destination: "/shop/when-it-all-goes-wrong",
        permanent: true,
      },
      { source: "/products/:path*", destination: "/shop", permanent: true },
      { source: "/blog/:path*", destination: "/insights", permanent: true },
      { source: "/services/education", destination: "/courses", permanent: true },
      { source: "/services/data-analyst", destination: "/services", permanent: true },
      { source: "/branding", destination: "/services/branding", permanent: true },
      {
        source: "/branded-merchandise",
        destination: "/services/branded-merchandise",
        permanent: true,
      },
      { source: "/graphic-design", destination: "/services/graphic-design", permanent: true },
      { source: "/animation-video", destination: "/services/animation-video", permanent: true },
      {
        source: "/photography-videography",
        destination: "/services/photography-videography",
        permanent: true,
      },
      { source: "/web-development", destination: "/services/web-development", permanent: true },
      {
        source: "/online-presence-management",
        destination: "/services/online-presence-management",
        permanent: true,
      },
      { source: "/digital-marketing", destination: "/services/digital-marketing", permanent: true },
      {
        source: "/affinity-by-canva-the-free-forever-revolution-too-good-to-be-true",
        destination: "/insights/affinity-by-canva-the-free-forever-revolution-too-good-to-be-true",
        permanent: true,
      },
      {
        source:
          "/the-new-funding-blueprint-how-startups-are-securing-capital-in-2025s-cautious-climate",
        destination:
          "/insights/the-new-funding-blueprint-how-startups-are-securing-capital-in-2025s-cautious-climate",
        permanent: true,
      },
      {
        source: "/salesforce-power-automate-integration-a-comprehensive-guide",
        destination: "/insights/salesforce-power-automate-integration-a-comprehensive-guide",
        permanent: true,
      },
      {
        source: "/how-to-create-a-powerful-brand-story-that-attracts-customers-and-builds-loyalty",
        destination:
          "/insights/how-to-create-a-powerful-brand-story-that-attracts-customers-and-builds-loyalty",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
