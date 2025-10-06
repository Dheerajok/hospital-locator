import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Load base Next.js + TypeScript config
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 👇 Add your custom overrides here
  {
    rules: {
      "@next/next/no-img-element": "off",      // allow <img> instead of <Image>
      "react/no-unescaped-entities": "off",    // allow unescaped quotes in JSX
      "no-unused-vars": "warn",                // downgrade unused var errors
      "react/prop-types": "off",               // disable prop-types rule
    },
  },
];

export default eslintConfig;
