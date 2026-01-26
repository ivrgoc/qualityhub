import { describe, it, expect } from 'vitest';
import { TestStatus } from '@/types';
import { getStatusColor, getStatusIcon, getStatusLabel } from './status';

describe('status utilities', () => {
  describe('getStatusColor', () => {
    it('should return green colors for PASSED status', () => {
      const color = getStatusColor(TestStatus.PASSED);
      expect(color.bg).toBe('bg-green-100');
      expect(color.text).toBe('text-green-800');
      expect(color.border).toBe('border-green-200');
    });

    it('should return red colors for FAILED status', () => {
      const color = getStatusColor(TestStatus.FAILED);
      expect(color.bg).toBe('bg-red-100');
      expect(color.text).toBe('text-red-800');
      expect(color.border).toBe('border-red-200');
    });

    it('should return orange colors for BLOCKED status', () => {
      const color = getStatusColor(TestStatus.BLOCKED);
      expect(color.bg).toBe('bg-orange-100');
      expect(color.text).toBe('text-orange-800');
      expect(color.border).toBe('border-orange-200');
    });

    it('should return yellow colors for RETEST status', () => {
      const color = getStatusColor(TestStatus.RETEST);
      expect(color.bg).toBe('bg-yellow-100');
      expect(color.text).toBe('text-yellow-800');
      expect(color.border).toBe('border-yellow-200');
    });

    it('should return gray colors for SKIPPED status', () => {
      const color = getStatusColor(TestStatus.SKIPPED);
      expect(color.bg).toBe('bg-gray-100');
      expect(color.text).toBe('text-gray-600');
      expect(color.border).toBe('border-gray-200');
    });

    it('should return slate colors for UNTESTED status', () => {
      const color = getStatusColor(TestStatus.UNTESTED);
      expect(color.bg).toBe('bg-slate-100');
      expect(color.text).toBe('text-slate-600');
      expect(color.border).toBe('border-slate-200');
    });

    it('should return all three color properties', () => {
      const color = getStatusColor(TestStatus.PASSED);
      expect(color).toHaveProperty('bg');
      expect(color).toHaveProperty('text');
      expect(color).toHaveProperty('border');
    });
  });

  describe('getStatusIcon', () => {
    it('should return check-circle for PASSED status', () => {
      expect(getStatusIcon(TestStatus.PASSED)).toBe('check-circle');
    });

    it('should return x-circle for FAILED status', () => {
      expect(getStatusIcon(TestStatus.FAILED)).toBe('x-circle');
    });

    it('should return ban for BLOCKED status', () => {
      expect(getStatusIcon(TestStatus.BLOCKED)).toBe('ban');
    });

    it('should return refresh for RETEST status', () => {
      expect(getStatusIcon(TestStatus.RETEST)).toBe('refresh');
    });

    it('should return skip-forward for SKIPPED status', () => {
      expect(getStatusIcon(TestStatus.SKIPPED)).toBe('skip-forward');
    });

    it('should return circle for UNTESTED status', () => {
      expect(getStatusIcon(TestStatus.UNTESTED)).toBe('circle');
    });
  });

  describe('getStatusLabel', () => {
    it('should return "Passed" for PASSED status', () => {
      expect(getStatusLabel(TestStatus.PASSED)).toBe('Passed');
    });

    it('should return "Failed" for FAILED status', () => {
      expect(getStatusLabel(TestStatus.FAILED)).toBe('Failed');
    });

    it('should return "Blocked" for BLOCKED status', () => {
      expect(getStatusLabel(TestStatus.BLOCKED)).toBe('Blocked');
    });

    it('should return "Retest" for RETEST status', () => {
      expect(getStatusLabel(TestStatus.RETEST)).toBe('Retest');
    });

    it('should return "Skipped" for SKIPPED status', () => {
      expect(getStatusLabel(TestStatus.SKIPPED)).toBe('Skipped');
    });

    it('should return "Untested" for UNTESTED status', () => {
      expect(getStatusLabel(TestStatus.UNTESTED)).toBe('Untested');
    });
  });
});
