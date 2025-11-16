import antfu from "@antfu/eslint-config";
import drizzle from "eslint-plugin-drizzle";

export default antfu({
  typescript: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
  plugins: {
    drizzle,
  },
}, {
  rules: {
    "style/brace-style": ["error", "1tbs", { allowSingleLine: true }],
  },
}, {
  files: ["**/*.{ts}"],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    ...drizzle.configs.recommended.rules,
    "ts/strict-boolean-expressions": ["error", {
      allowNumber: false,
      allowNullableNumber: false,
    }],
  },
});
