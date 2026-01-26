import { TestStatus } from '@/types';

export interface StatusColorConfig {
  bg: string;
  text: string;
  border: string;
}

const STATUS_COLORS: Record<TestStatus, StatusColorConfig> = {
  [TestStatus.PASSED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  [TestStatus.FAILED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  [TestStatus.BLOCKED]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  [TestStatus.RETEST]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [TestStatus.SKIPPED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  [TestStatus.UNTESTED]: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

const DEFAULT_STATUS_COLOR: StatusColorConfig = {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  border: 'border-slate-200',
};

export type StatusIcon =
  | 'check-circle'
  | 'x-circle'
  | 'ban'
  | 'refresh'
  | 'skip-forward'
  | 'circle';

const STATUS_ICONS: Record<TestStatus, StatusIcon> = {
  [TestStatus.PASSED]: 'check-circle',
  [TestStatus.FAILED]: 'x-circle',
  [TestStatus.BLOCKED]: 'ban',
  [TestStatus.RETEST]: 'refresh',
  [TestStatus.SKIPPED]: 'skip-forward',
  [TestStatus.UNTESTED]: 'circle',
};

const DEFAULT_STATUS_ICON: StatusIcon = 'circle';

/**
 * Get Tailwind CSS color classes for a test status
 */
export function getStatusColor(status: TestStatus): StatusColorConfig {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
}

/**
 * Get the icon name for a test status
 */
export function getStatusIcon(status: TestStatus): StatusIcon {
  return STATUS_ICONS[status] ?? DEFAULT_STATUS_ICON;
}

/**
 * Get the display label for a test status
 */
export function getStatusLabel(status: TestStatus): string {
  const labels: Record<TestStatus, string> = {
    [TestStatus.PASSED]: 'Passed',
    [TestStatus.FAILED]: 'Failed',
    [TestStatus.BLOCKED]: 'Blocked',
    [TestStatus.RETEST]: 'Retest',
    [TestStatus.SKIPPED]: 'Skipped',
    [TestStatus.UNTESTED]: 'Untested',
  };
  return labels[status] ?? status;
}
