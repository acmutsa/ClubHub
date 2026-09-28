import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

import { namingConventionsPlugin } from "./eslint-rules/naming-conventions.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "guidelines/.vitepress/cache/**",
      "guidelines/.vitepress/dist/**",
      "guidelines/.vitepress/.temp/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      clubhub: namingConventionsPlugin,
    },
    rules: {
      "clubhub/filename-case": "error",
      "clubhub/exported-names": "error",
    },
  },
]

export default eslintConfig
