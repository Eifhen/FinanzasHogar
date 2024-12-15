import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const IDENTACION = 2;

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "indent": ['error', IDENTACION],
      "require-await": "off",
      "require-await": "off",
      "object-shorthand": "warn",
      "wrap-iife": "warn",
      "default-param-last": "error",
     // "function-paren-newline": ["error", "always"],
  
      "prefer-const" : "error",
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
      "no-promise-executor-return" : "error",
      "no-async-promise-executor": "error",
      "no-eval": "error",
      "no-use-before-define": "error",
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
