import {
  format,
  formatDistance,
  formatRelative,
  isValid,
  parseISO,
  differenceInDays,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
} from 'date-fns';

/**
 * Format a date to a standard display format
 */
export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string, baseDate = new Date()): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  return formatDistance(dateObj, baseDate, { addSuffix: true });
}

/**
 * Format a date relative to another date
 */
export function formatRelativeDate(date: Date | string, baseDate = new Date()): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  return formatRelative(dateObj, baseDate);
}

/**
 * Calculate days remaining until a due date
 */
export function getDaysRemaining(dueDate: Date | string): number {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(dateObj)) {
    return 0;
  }
  return differenceInDays(dateObj, startOfDay(new Date()));
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(dateObj)) {
    return false;
  }
  return isBefore(endOfDay(dateObj), new Date());
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return false;
  }
  return isAfter(dateObj, new Date());
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
}

export { isValid, parseISO };
