import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'plan/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.svelte'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: { ...globals.browser, $state: 'readonly' },
    },
  },
  {
    files: ['*.js', 'tests/**/*.mjs', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
