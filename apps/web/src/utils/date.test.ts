import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getDaysRemaining,
  isOverdue,
  isFutureDate,
  addDaysToDate,
  subtractDaysFromDate,
  isValid,
  parseISO,
} from './date';

describe('date utilities', () => {
  const fixedDate = new Date('2024-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format a Date object with default format', () => {
      const date = new Date('2024-06-15');
      expect(formatDate(date)).toBe('Jun 15, 2024');
    });

    it('should format an ISO string with default format', () => {
      expect(formatDate('2024-06-15')).toBe('Jun 15, 2024');
    });

    it('should format with custom format string', () => {
      expect(formatDate('2024-06-15', 'yyyy-MM-dd')).toBe('2024-06-15');
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatDate('invalid')).toBe('Invalid date');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const result = formatDateTime('2024-06-15T14:30:00');
      expect(result).toMatch(/Jun 15, 2024/);
      expect(result).toMatch(/2:30 PM/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return relative time for past dates', () => {
      const pastDate = new Date('2024-06-10T12:00:00Z');
      const result = formatRelativeTime(pastDate, fixedDate);
      expect(result).toBe('5 days ago');
    });

    it('should return relative time for future dates', () => {
      const futureDate = new Date('2024-06-20T12:00:00Z');
      const result = formatRelativeTime(futureDate, fixedDate);
      expect(result).toBe('in 5 days');
    });

    it('should handle string dates', () => {
      const result = formatRelativeTime('2024-06-14T12:00:00Z', fixedDate);
      expect(result).toBe('1 day ago');
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatRelativeTime('invalid', fixedDate)).toBe('Invalid date');
    });
  });

  describe('getDaysRemaining', () => {
    it('should return positive days for future dates', () => {
      const dueDate = new Date('2024-06-20T00:00:00Z');
      const result = getDaysRemaining(dueDate);
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative days for past dates', () => {
      const dueDate = new Date('2024-06-10T00:00:00Z');
      const result = getDaysRemaining(dueDate);
      expect(result).toBeLessThan(0);
    });

    it('should return 0 for today', () => {
      const today = new Date('2024-06-15T00:00:00Z');
      const result = getDaysRemaining(today);
      expect(result).toBe(0);
    });

    it('should handle ISO string input', () => {
      const result = getDaysRemaining('2024-06-20T00:00:00Z');
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for invalid date', () => {
      expect(getDaysRemaining('invalid')).toBe(0);
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      expect(isOverdue('2024-06-10')).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isOverdue('2024-06-20')).toBe(false);
    });

    it('should return false for today', () => {
      expect(isOverdue('2024-06-15')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isOverdue('invalid')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      expect(isFutureDate('2024-06-20')).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFutureDate('2024-06-10')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isFutureDate('invalid')).toBe(false);
    });
  });

  describe('addDaysToDate', () => {
    it('should add days to a date', () => {
      const result = addDaysToDate('2024-06-15', 5);
      expect(formatDate(result, 'yyyy-MM-dd')).toBe('2024-06-20');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-06-15');
      const result = addDaysToDate(date, 10);
      expect(formatDate(result, 'yyyy-MM-dd')).toBe('2024-06-25');
    });
  });

  describe('subtractDaysFromDate', () => {
    it('should subtract days from a date', () => {
      const result = subtractDaysFromDate('2024-06-15', 5);
      expect(formatDate(result, 'yyyy-MM-dd')).toBe('2024-06-10');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-06-15');
      const result = subtractDaysFromDate(date, 10);
      expect(formatDate(result, 'yyyy-MM-dd')).toBe('2024-06-05');
    });
  });

  describe('isValid', () => {
    it('should return true for valid dates', () => {
      expect(isValid(new Date())).toBe(true);
      expect(isValid(parseISO('2024-06-15'))).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValid(new Date('invalid'))).toBe(false);
    });
  });

  describe('parseISO', () => {
    it('should parse ISO date strings', () => {
      const result = parseISO('2024-06-15');
      expect(isValid(result)).toBe(true);
      expect(formatDate(result, 'yyyy-MM-dd')).toBe('2024-06-15');
    });
  });
});
