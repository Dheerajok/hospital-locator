import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-vars": "off",                      // Completely disable
      "react/prop-types": "off",
      
      // 🔥 DISABLE THE PROBLEMATIC RULES:
      "@typescript-eslint/no-unused-vars": "off",   // Disable unused vars completely
      "@typescript-eslint/no-explicit-any": "off",  // Disable 'any' type errors completely
    },
  },
];

export default eslintConfig;
