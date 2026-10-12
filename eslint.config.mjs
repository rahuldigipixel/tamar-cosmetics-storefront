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
    // Production build output (NEXT_DIST_DIR=.next-prod, see next.config.ts) — generated bundles, not source.
    ".next-prod/**",
    "next-env.d.ts",
    // Claude Code's own folder (settings, worktrees) is not app source.
    ".claude/**",
  ]),
]);

export default eslintConfig;
