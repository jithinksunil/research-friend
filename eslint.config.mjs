import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['lib/enum.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Declare enums only in lib/enum.ts',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['interfaces/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration',
          message: 'Interfaces must be declared only inside interfaces/ directory',
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],
    ignores: ['types/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypeAliasDeclaration',
          message: 'Type aliases must be declared only inside types/ directory',
        },
      ],
    },
  },

  // Disable "any" errors
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      /**
       * ✅ Use THIS ONLY for imports
       */
      'unused-imports/no-unused-imports': 'error',

      /**
       * ⚡ Async safety
       */
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',

      /**
       * 🧠 Code quality
       */
      eqeqeq: 'off',
      curly: 'off',
      'no-debugger': 'error',

      /**
       * 📦 Imports
       */
      'import/order': 'off',
      'import/no-cycle': 'off',
      'no-duplicate-imports': 'error',
    },
  },

  // Override default ignores of eslint-config-next
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'app/generated/**',
    'coverage/**',
    'tests/mocks/**',
  ]),
]);

export default eslintConfig;
