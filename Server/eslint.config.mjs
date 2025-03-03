import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";


// const INDENT = 2;
const SWITCH_INDENT = 1;
const CHAINING_INDENT = 0;
const OBJECT_INDENT = 1;

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	tseslint.configs.stylistic,
	{
		files: ["**/*.{js,mjs,cjs,ts}"],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			"indent": ['error', "tab", {
				"SwitchCase": SWITCH_INDENT,
				"MemberExpression": CHAINING_INDENT,
				"ObjectExpression": OBJECT_INDENT,
				"offsetTernaryExpressions": true,
			}],
			"default-param-last": "error",
			"prefer-const": "error",
			"prefer-template": "error",
			"prefer-rest-params": "error",
			"prefer-spread": "error",
			"no-const-assign": "error",
			"no-new-object": "error",
			"no-new-func": "error",
			"no-array-constructor": "error",
			"no-object-constructor": "error",
			"no-promise-executor-return": "error",
			"no-async-promise-executor": "error",
			"no-eval": "error",
			"no-use-before-define": "error",
			// "function-paren-newline": ["error", "always"],
			
			"no-magic-numbers": "off",
			"require-await": "off",
			"no-dupe-class-members": "off",
			"prefer-destructuring": "off",
			"no-tabs": "off",

			"object-shorthand": "warn",
			"wrap-iife": "warn",
			"no-await-in-loop": "warn",
			// "no-param-reassign": "warn",

			"@typescript-eslint/require-await": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/no-empty-object-type": "off",

			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-floating-promises": "warn",
			
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-return": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/no-mixed-enums": "error",
			"@typescript-eslint/no-for-in-array": "error",
			"@typescript-eslint/no-loop-func": "error",
			"@typescript-eslint/no-magic-numbers": ["error", { 
				"ignoreDefaultValues": true,
				"ignoreEnums": true,
				"ignoreNumericLiteralTypes" : true,
				"ignoreReadonlyClassProperties": true,
				"ignoreTypeIndexes": true
			}],
			"@typescript-eslint/no-this-alias": "error",
		},
	},
	{
		ignores: [
			"ecosystem.config.js"
		],
	},
);