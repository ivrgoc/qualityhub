/**
 * React ESLint configuration extending the base config
 * @type {import('eslint').Linter.Config[]}
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Creates the React ESLint configuration
 * @param {Object} options - Configuration options
 * @param {string[]} [options.files] - File patterns to lint (default: TS/TSX files)
 * @param {string[]} [options.ignores] - Additional patterns to ignore
 * @param {Object} [options.reactHooksPlugin] - eslint-plugin-react-hooks (must be passed by consumer)
 * @param {Object} [options.reactRefreshPlugin] - eslint-plugin-react-refresh (must be passed by consumer)
 * @returns {import('eslint').Linter.Config[]} ESLint configuration array
 */
export function createReactConfig(options = {}) {
  const {
    files = ['**/*.ts', '**/*.tsx'],
    ignores = [],
    reactHooksPlugin,
    reactRefreshPlugin,
  } = options;

  const plugins = {};
  const rules = {};

  // Add react-hooks plugin and rules if provided
  if (reactHooksPlugin) {
    plugins['react-hooks'] = reactHooksPlugin;
    Object.assign(rules, reactHooksPlugin.configs.recommended.rules);
  }

  // Add react-refresh plugin and rules if provided
  if (reactRefreshPlugin) {
    plugins['react-refresh'] = reactRefreshPlugin;
    rules['react-refresh/only-export-components'] = [
      'warn',
      { allowConstantExport: true },
    ];
  }

  return tseslint.config(
    {
      ignores: [
        'dist/**',
        'build/**',
        'coverage/**',
        'node_modules/**',
        ...ignores,
      ],
    },
    {
      extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
      files,
      languageOptions: {
        ecmaVersion: 2022,
        globals: {
          ...globals.browser,
          ...globals.es2022,
        },
      },
      plugins,
      rules: {
        // Base TypeScript rules
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

        // React-specific rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
        eqeqeq: ['error', 'always', { null: 'ignore' }],

        // Merge provided rules
        ...rules,
      },
    }
  );
}

// Default export for simple usage (without plugins)
export default createReactConfig();
