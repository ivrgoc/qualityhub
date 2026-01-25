# @qualityhub/eslint-config

Shared ESLint configurations for QualityHub projects.

## Installation

```bash
pnpm add -D @qualityhub/eslint-config eslint typescript
```

## Available Configurations

### Base (TypeScript)

For TypeScript-only projects:

```js
// eslint.config.js
import { createBaseConfig } from '@qualityhub/eslint-config';

export default createBaseConfig();

// Or with options
export default createBaseConfig({
  files: ['src/**/*.ts'],
  ignores: ['generated/**'],
});
```

### React

For React + TypeScript projects:

```js
// eslint.config.js
import { createReactConfig } from '@qualityhub/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default createReactConfig({
  reactHooksPlugin: reactHooks,
  reactRefreshPlugin: reactRefresh,
});
```

### NestJS

For NestJS + TypeScript projects:

```js
// eslint.config.js
import { createNestJSConfig } from '@qualityhub/eslint-config';
import prettierConfig from 'eslint-config-prettier';

export default createNestJSConfig({
  tsconfigPath: './tsconfig.json',
  prettierConfig,
});
```

## Configuration Options

### createBaseConfig(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | `string[]` | `['**/*.ts', '**/*.tsx']` | File patterns to lint |
| `ignores` | `string[]` | `[]` | Additional patterns to ignore |

### createReactConfig(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | `string[]` | `['**/*.ts', '**/*.tsx']` | File patterns to lint |
| `ignores` | `string[]` | `[]` | Additional patterns to ignore |
| `reactHooksPlugin` | `object` | - | eslint-plugin-react-hooks |
| `reactRefreshPlugin` | `object` | - | eslint-plugin-react-refresh |

### createNestJSConfig(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `files` | `string[]` | `['src/**/*.ts']` | Source file patterns |
| `testFiles` | `string[]` | `['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts']` | Test file patterns |
| `ignores` | `string[]` | `[]` | Additional patterns to ignore |
| `tsconfigPath` | `string` | `'./tsconfig.json'` | Path to tsconfig |
| `prettierConfig` | `object` | - | eslint-config-prettier |

## Included Rules

All configurations include:

- ESLint recommended rules
- TypeScript ESLint recommended rules
- `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`
- `prefer-const`, `no-var`, `eqeqeq`
- `no-console` (warning, allows `warn`/`error`)

Additional rules for each configuration:

- **React**: Browser globals, react-hooks rules, react-refresh rules
- **NestJS**: Node globals, relaxed rules for test files, test globals (jest, describe, it, etc.)
