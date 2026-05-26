import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/api";

// manifest.ts uses the Next 16 file convention to serve
// /manifest.webmanifest. Drives PWA install prompts, theme colour on
// mobile address bars, and the home-screen icon set.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Nairobi creative agency crafting brands, websites, animation, and digital experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5", // cream
    theme_color: "#ef5a28", // brand-500
    icons: [
      // The SVG mark covers any size for modern browsers; iOS picks
      // up the apple-touch path via app/apple-icon convention if we
      // add it later.
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
