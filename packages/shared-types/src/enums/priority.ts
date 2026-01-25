export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const PRIORITY_VALUES = Object.values(Priority);

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && PRIORITY_VALUES.includes(value as Priority);
}
