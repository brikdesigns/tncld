import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
    // Legacy Webflow site (pre-migration) — not part of the Next.js app.
    // Retained in the repo per scope; excluded from the app's lint surface.
    "about/**",
    "archive/**",
    "bds/**",
    "css/**",
    "csv/**",
    "design-tokens/**",
    "js/**",
    "json/**",
    "legal/**",
    "markdown/**",
    "patient-resources/**",
    "scripts/**",
    "updates/**",
    "footer.js",
  ]),
]);

export default eslintConfig;
