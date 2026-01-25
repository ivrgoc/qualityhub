import { describe, it, expect } from 'vitest';
import { createBaseConfig, createReactConfig, createNestJSConfig } from '../index.js';

describe('@qualityhub/eslint-config', () => {
  describe('createBaseConfig', () => {
    it('should return an array of configurations', () => {
      const config = createBaseConfig();
      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
    });

    it('should include default ignores', () => {
      const config = createBaseConfig();
      const ignoresConfig = config.find((c) => c.ignores && !c.files);
      expect(ignoresConfig).toBeDefined();
      expect(ignoresConfig.ignores).toContain('dist/**');
      expect(ignoresConfig.ignores).toContain('node_modules/**');
    });

    it('should accept custom ignores', () => {
      const config = createBaseConfig({ ignores: ['custom/**'] });
      const ignoresConfig = config.find((c) => c.ignores && !c.files);
      expect(ignoresConfig.ignores).toContain('custom/**');
    });

    it('should accept custom files pattern', () => {
      const config = createBaseConfig({ files: ['src/**/*.ts'] });
      // Find config that has our custom files and rules
      const rulesConfig = config.find(
        (c) => c.files && c.rules && c.files.includes('src/**/*.ts')
      );
      expect(rulesConfig).toBeDefined();
      expect(rulesConfig.files).toContain('src/**/*.ts');
    });

    it('should include TypeScript no-unused-vars rule with pattern', () => {
      const config = createBaseConfig();
      // Find the config that has our custom @typescript-eslint/no-unused-vars rule with the pattern
      const rulesConfig = config.find((c) => {
        const rule = c.rules?.['@typescript-eslint/no-unused-vars'];
        return Array.isArray(rule) && rule[1]?.argsIgnorePattern === '^_';
      });
      expect(rulesConfig).toBeDefined();
      const rule = rulesConfig.rules['@typescript-eslint/no-unused-vars'];
      expect(rule[0]).toBe('error');
      expect(rule[1].argsIgnorePattern).toBe('^_');
    });
  });

  describe('createReactConfig', () => {
    it('should return an array of configurations', () => {
      const config = createReactConfig();
      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
    });

    it('should include browser globals', () => {
      const config = createReactConfig();
      const mainConfig = config.find((c) => c.languageOptions?.globals);
      expect(mainConfig).toBeDefined();
      expect(mainConfig.languageOptions.globals).toBeDefined();
    });

    it('should accept react-hooks plugin', () => {
      const mockPlugin = {
        configs: {
          recommended: {
            rules: {
              'react-hooks/rules-of-hooks': 'error',
            },
          },
        },
      };
      const config = createReactConfig({ reactHooksPlugin: mockPlugin });
      // Check that plugin and rules are included somewhere in the config
      const configWithPlugins = config.find(
        (c) => c.plugins && c.plugins['react-hooks']
      );
      expect(configWithPlugins).toBeDefined();
      expect(configWithPlugins.plugins['react-hooks']).toBe(mockPlugin);
    });

    it('should accept react-refresh plugin', () => {
      const mockPlugin = {};
      const config = createReactConfig({ reactRefreshPlugin: mockPlugin });
      const configWithPlugins = config.find(
        (c) => c.plugins && c.plugins['react-refresh']
      );
      expect(configWithPlugins).toBeDefined();
      expect(configWithPlugins.plugins['react-refresh']).toBe(mockPlugin);
    });

    it('should include default ignores', () => {
      const config = createReactConfig();
      const ignoresConfig = config.find((c) => c.ignores && !c.files);
      expect(ignoresConfig).toBeDefined();
      expect(ignoresConfig.ignores).toContain('dist/**');
      expect(ignoresConfig.ignores).toContain('node_modules/**');
    });
  });

  describe('createNestJSConfig', () => {
    it('should return an array of configurations', () => {
      const config = createNestJSConfig();
      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
    });

    it('should include source and test file configurations', () => {
      const config = createNestJSConfig();
      const srcConfig = config.find((c) => c.files?.includes('src/**/*.ts'));
      const testConfig = config.find((c) => c.files?.some((f) => f.includes('test')));
      expect(srcConfig).toBeDefined();
      expect(testConfig).toBeDefined();
    });

    it('should include node globals in source files', () => {
      const config = createNestJSConfig();
      const srcConfig = config.find((c) => c.files?.includes('src/**/*.ts'));
      expect(srcConfig.languageOptions.globals.process).toBe('readonly');
      expect(srcConfig.languageOptions.globals.console).toBe('readonly');
    });

    it('should include test globals in test files', () => {
      const config = createNestJSConfig();
      const testConfig = config.find((c) => c.files?.some((f) => f.includes('test')));
      expect(testConfig.languageOptions.globals.describe).toBe('readonly');
      expect(testConfig.languageOptions.globals.it).toBe('readonly');
      expect(testConfig.languageOptions.globals.expect).toBe('readonly');
      expect(testConfig.languageOptions.globals.jest).toBe('readonly');
    });

    it('should accept custom tsconfig path', () => {
      const config = createNestJSConfig({ tsconfigPath: './tsconfig.build.json' });
      const srcConfig = config.find((c) => c.files?.includes('src/**/*.ts'));
      expect(srcConfig.languageOptions.parserOptions.project).toBe('./tsconfig.build.json');
    });

    it('should accept prettier config', () => {
      const mockPrettierConfig = { rules: { 'prettier/prettier': 'error' } };
      const config = createNestJSConfig({ prettierConfig: mockPrettierConfig });
      expect(config).toContain(mockPrettierConfig);
    });

    it('should relax no-explicit-any rule for tests', () => {
      const config = createNestJSConfig();
      const testConfig = config.find((c) => c.files?.some((f) => f.includes('test')));
      expect(testConfig.rules['@typescript-eslint/no-explicit-any']).toBe('off');
    });

    it('should include default ignores', () => {
      const config = createNestJSConfig();
      const ignoresConfig = config.find((c) => c.ignores && !c.files);
      expect(ignoresConfig).toBeDefined();
      expect(ignoresConfig.ignores).toContain('dist/**');
      expect(ignoresConfig.ignores).toContain('node_modules/**');
    });
  });
});
