import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-require-imports': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn'
		}
	},
	{
		ignores: [
			'node_modules/',
			'build/',
			'dist/',

			'.svelte-kit/',
			'.vercel/',
			'.DS_Store',
			'.env',
			'.env.*',
			'!.env.example',

			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock'
		]
	}
];
