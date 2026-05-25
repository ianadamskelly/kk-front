import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Cover images are served by the Go backend; plain <img> is intentional.
      "@next/next/no-img-element": "off",
      // Fetching data on mount via a load() helper is an intentional pattern
      // throughout the admin CMS; the single extra render is acceptable here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
