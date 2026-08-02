import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: currentDirectory });

const config = [
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "outputs/**",
      "work/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
];

export default config;
