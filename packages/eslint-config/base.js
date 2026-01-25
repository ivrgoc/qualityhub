/**
 * Base ESLint configuration for TypeScript projects
 * @type {import('eslint').Linter.Config[]}
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Creates the base ESLint configuration for TypeScript projects
 * @param {Object} options - Configuration options
 * @param {string[]} [options.files] - File patterns to lint (default: TS/TSX files)
 * @param {string[]} [options.ignores] - Additional patterns to ignore
 * @returns {import('eslint').Linter.Config[]} ESLint configuration array
 */
export function createBaseConfig(options = {}) {
  const { files = ['**/*.ts', '**/*.tsx'], ignores = [] } = options;

  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files,
      rules: {
        // TypeScript-specific rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-require-imports': 'off',

        // General rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
        eqeqeq: ['error', 'always', { null: 'ignore' }],
      },
    },
    {
      ignores: [
        'dist/**',
        'build/**',
        'coverage/**',
        'node_modules/**',
        '*.config.js',
        '*.config.mjs',
        '*.config.ts',
        ...ignores,
      ],
    }
  );
}

// Default export for simple usage
export default createBaseConfig();
