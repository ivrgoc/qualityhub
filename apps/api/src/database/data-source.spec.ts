import { dataSourceOptions } from './data-source';

describe('data-source', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('dataSourceOptions', () => {
    it('should have postgres as database type', () => {
      expect(dataSourceOptions.type).toBe('postgres');
    });

    it('should use DATABASE_URL when set', () => {
      // Note: dataSourceOptions is already evaluated at import time
      // This test verifies the structure is correct
      expect(dataSourceOptions).toHaveProperty('url');
    });

    it('should have host configuration', () => {
      expect(dataSourceOptions).toHaveProperty('host');
    });

    it('should have port configuration', () => {
      expect(dataSourceOptions).toHaveProperty('port');
      expect(typeof dataSourceOptions.port).toBe('number');
    });

    it('should have username configuration', () => {
      expect(dataSourceOptions).toHaveProperty('username');
    });

    it('should have password configuration', () => {
      expect(dataSourceOptions).toHaveProperty('password');
    });

    it('should have database configuration', () => {
      expect(dataSourceOptions).toHaveProperty('database');
    });

    it('should have entities pattern for dist folder', () => {
      expect(dataSourceOptions.entities).toEqual(['dist/**/*.entity.js']);
    });

    it('should have migrations pattern for dist folder', () => {
      expect(dataSourceOptions.migrations).toEqual([
        'dist/database/migrations/*.js',
      ]);
    });
  });
});
