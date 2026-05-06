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
    ".vite/**",
    "backup-vite/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/legacy-App.tsx",
    "src/legacy-main.tsx",
    "src/legacy-layouts/**",
    "src/legacy-pages/**",
  ]),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
