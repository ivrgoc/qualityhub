/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the vite config file content and parse key configuration values
const configPath = path.join(__dirname, 'vite.config.ts');
const configContent = fs.readFileSync(configPath, 'utf-8');

describe('vite.config.ts', () => {
  describe('file existence', () => {
    it('should exist in apps/web directory', () => {
      expect(fs.existsSync(configPath)).toBe(true);
    });
  });

  describe('plugins', () => {
    it('should include React plugin', () => {
      expect(configContent).toContain("import react from '@vitejs/plugin-react'");
      expect(configContent).toContain('plugins: [react()]');
    });
  });

  describe('path alias', () => {
    it('should define @ alias pointing to src directory', () => {
      expect(configContent).toContain("'@': path.resolve(__dirname, './src')");
    });

    it('should import path module for alias resolution', () => {
      expect(configContent).toContain("import path from 'path'");
    });
  });

  describe('server configuration', () => {
    it('should set development server port to 3000', () => {
      expect(configContent).toContain('port: 3000');
    });

    describe('API proxy', () => {
      it('should proxy /api requests', () => {
        expect(configContent).toContain("'/api':");
      });

      it('should target backend at localhost:3001', () => {
        expect(configContent).toContain("target: 'http://localhost:3001'");
      });

      it('should enable changeOrigin for cross-origin requests', () => {
        expect(configContent).toContain('changeOrigin: true');
      });
    });
  });

  describe('build configuration', () => {
    it('should output to dist directory', () => {
      expect(configContent).toContain("outDir: 'dist'");
    });

    it('should enable source maps', () => {
      expect(configContent).toContain('sourcemap: true');
    });
  });

  describe('test configuration', () => {
    it('should enable globals for vitest', () => {
      expect(configContent).toContain('globals: true');
    });

    it('should use jsdom environment', () => {
      expect(configContent).toContain("environment: 'jsdom'");
    });

    it('should include setup file', () => {
      expect(configContent).toContain('./src/test/setup.ts');
    });
  });

  describe('configuration structure validation', () => {
    it('should use defineConfig from vite', () => {
      expect(configContent).toContain("import { defineConfig } from 'vite'");
      expect(configContent).toContain('export default defineConfig(');
    });

    it('should have resolve.alias configuration block', () => {
      expect(configContent).toMatch(/resolve:\s*\{[\s\S]*alias:/);
    });

    it('should have server.proxy configuration block', () => {
      expect(configContent).toMatch(/server:\s*\{[\s\S]*proxy:/);
    });
  });
});
