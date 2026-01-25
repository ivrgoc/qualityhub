/**
 * NestJS ESLint configuration extending the base config
 * @type {import('eslint').Linter.Config[]}
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Creates the NestJS ESLint configuration
 * @param {Object} options - Configuration options
 * @param {string[]} [options.files] - File patterns to lint (default: src files)
 * @param {string[]} [options.testFiles] - Test file patterns
 * @param {string[]} [options.ignores] - Additional patterns to ignore
 * @param {string} [options.tsconfigPath] - Path to tsconfig for type-aware linting
 * @param {Object} [options.prettierConfig] - eslint-config-prettier (must be passed by consumer)
 * @returns {import('eslint').Linter.Config[]} ESLint configuration array
 */
export function createNestJSConfig(options = {}) {
  const {
    files = ['src/**/*.ts'],
    testFiles = ['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts'],
    ignores = [],
    tsconfigPath = './tsconfig.json',
    prettierConfig,
  } = options;

  const nodeGlobals = {
    process: 'readonly',
    console: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    module: 'readonly',
    require: 'readonly',
    Buffer: 'readonly',
    setTimeout: 'readonly',
    setInterval: 'readonly',
    clearTimeout: 'readonly',
    clearInterval: 'readonly',
  };

  const testGlobals = {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
    test: 'readonly',
  };

  const baseRules = {
    '@typescript-eslint/interface-name-prefix': 'off',
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
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
  };

  const config = tseslint.config(
    {
      ignores: [
        'dist/**',
        'build/**',
        'coverage/**',
        'node_modules/**',
        ...ignores,
      ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files,
      languageOptions: {
        parserOptions: {
          project: tsconfigPath,
          sourceType: 'module',
        },
        globals: {
          ...globals.node,
          ...nodeGlobals,
        },
      },
      rules: baseRules,
    },
    {
      files: testFiles,
      languageOptions: {
        parserOptions: {
          sourceType: 'module',
        },
        globals: {
          ...globals.node,
          ...nodeGlobals,
          ...testGlobals,
        },
      },
      rules: {
        ...baseRules,
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    }
  );

  // Add prettier config if provided
  if (prettierConfig) {
    config.push(prettierConfig);
  }

  return config;
}

// Default export for simple usage
export default createNestJSConfig();
