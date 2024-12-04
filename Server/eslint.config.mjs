import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


const INDENT = 2;

export default tseslint.Config(
  pluginJs.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylistic,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    lenguageOptions: {
      globals: globals.browser
    },
    rules: {
      "indent": ['error', INDENT],
      "require-await": "off",
      "object-shorthand": "warn",
      "wrap-iife": "warn",
      "default-param-last": "error",
      // "function-paren-newline": ["error", "always"],

      "prefer-const": "error",
      "prefer-template": "error",
      "prefer-rest-params": "error",
      "prefer-destructuring": ["error", { "array": true, "object": true }],
      "prefer-spread": "error",

      "no-dupe-class-members": "error",
      "no-await-in-loop": "warn",
      "no-const-assign": "error",
      "no-new-object": "error",
      "no-new-func": "error",
      // "no-param-reassign": "warn",
      "no-array-constructor": "error",
      "no-promise-executor-return": "error",
      "no-async-promise-executor": "error",
      "no-eval": "error",
      "no-use-before-define": "error",

      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-mixed-enums": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-loop-func": "error",
      "@typescript-eslint/no-magic-numbers": "error",
      "@typescript-eslint/consistent-type-definitions": "error", // los objetos se definen con interface y no con type
      "@typescript-eslint/no-this-alias": "error",
    }
  }
);