module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.turbo/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // Test globals. Without this, `no-undef` reports every describe/it/expect
      // as undefined — 120 false positives that drowned out real findings.
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/__tests__/**',
        '**/jest.setup.js',
        '**/jest.config.js',
      ],
      env: { jest: true },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      // react-hooks is installed but was never registered, so every
      // `eslint-disable react-hooks/exhaustive-deps` in the codebase errored
      // with "rule not found" — and the rule itself never ran. Stale-closure
      // bugs are worth catching.
      plugins: ['react-hooks'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            // Underscore-prefixed bindings are intentionally discarded. Covers
            // the omit idiom: const { [key]: _, ...rest } = obj
            varsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
};
