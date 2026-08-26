/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    // Single lint-only project covering every lintable .ts. This layout ships no
    // root tsconfig.json, and the package tsconfigs exclude their own tests, so a
    // dedicated tsconfig.eslint.json is the only project that covers everything.
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // must be last — disables stylistic rules conflicting with Prettier
  ],
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
      node: true,
    },
  },
  rules: {
    // ---- Type safety ----
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

    // ---- Style / safety ----
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],

    // ---- Imports ----
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-default-export': 'error', // override per-file for React pages
    'import/no-cycle': 'error',

    // ---- Architectural boundaries (lint-enforced) ----
    // See AGENTS.md Section 5. Don't suppress these without an ADR.
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/apps/*/src/**', '!**/apps/<self>/**'],
            message: 'apps/* cannot import from each other. Extract shared code to packages/shared.',
          },
          {
            group: ['**/features/*/**', '!**/features/<self>/**'],
            message: 'features/* slices cannot import from each other. Refactor or open an ADR.',
          },
          {
            group: ['**/apps/**', '**/features/**'],
            message: 'packages/shared cannot import from apps/* or features/*. Inversion-of-control violation.',
            // This rule applies when imported FROM packages/shared - see override below.
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      // React pages / Next.js routes commonly require default export
      files: ['**/pages/**/*.tsx', '**/app/**/*.tsx', 'vite.config.ts', 'vitest.config.ts', '**/eslint.config.*'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      // Plain CJS/JS config files are in no tsconfig project, so the type-aware
      // rules inherited above have no parserServices and THROW (they do not just
      // misfire). `disable-type-checked` scopes them off — configuration, not a
      // suppression (AGENTS.md Sec 9).
      files: ['*.cjs', '*.js'],
      parser: 'espree',
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        // Set explicitly in the top-level `rules` block, which outranks an
        // override's `extends` — so these must be turned off here by name.
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '_stack-overlays/',
    // The ROOT tests/ tree belongs to pytest in hybrid/python layouts; the .ts
    // files in it have no runner and no root vitest. TS tests live in
    // packages/*/tests/. Delete this line if you wire a root TS test runner.
    'tests/**/*.ts',
    // apps/* ship as stubs with NO package.json, so they are not pnpm workspace
    // packages and their imports (e.g. pino in apps/api) are declared nowhere.
    // Delete this line the moment apps/<name> gains a package.json.
    'apps/**',
    'dist/',
    'build/',
    'coverage/',
    '.turbo/',
    '05_archive/',
    '03_history/',
  ],
};
