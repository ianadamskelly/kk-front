import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build output for Docker/Coolify deploys.
  output: "standalone",
  // Pin the workspace root to this folder so Next.js does not pick up an
  // unrelated lockfile elsewhere on the machine.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
