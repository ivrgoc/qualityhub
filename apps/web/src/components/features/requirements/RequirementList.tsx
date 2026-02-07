import { type FC, useMemo } from 'react';
import { FileQuestion, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Progress,
  Skeleton,
} from '@/components/ui';
import type { Requirement, RequirementStatus } from '@/store/api/requirementsApi';
import { cn } from '@/utils/cn';

export interface RequirementListProps {
  requirements: Requirement[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (requirement: Requirement) => void;
  className?: string;
}

const STATUS_BADGES: Record<RequirementStatus, { variant: 'default' | 'success' | 'warning' | 'destructive'; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  active: { variant: 'success', label: 'Active' },
  deprecated: { variant: 'warning', label: 'Deprecated' },
  completed: { variant: 'default', label: 'Completed' },
};

/**
 * Requirement list component displaying requirements with coverage status badges.
 */
export const RequirementList: FC<RequirementListProps> = ({
  requirements,
  isLoading,
  selectedId,
  onSelect,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className={cn('flex h-64 items-center justify-center', className)}>
        <div className="text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">No requirements found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {requirements.map((requirement) => (
        <RequirementCard
          key={requirement.id}
          requirement={requirement}
          isSelected={selectedId === requirement.id}
          onClick={() => onSelect?.(requirement)}
        />
      ))}
    </div>
  );
};

interface RequirementCardProps {
  requirement: Requirement;
  isSelected?: boolean;
  onClick?: () => void;
}

const RequirementCard: FC<RequirementCardProps> = ({
  requirement,
  isSelected,
  onClick,
}) => {
  const statusBadge = STATUS_BADGES[requirement.status];

  const coverageStatus = useMemo(() => {
    if (requirement.coveragePercentage >= 80) {
      return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
    }
    if (requirement.coveragePercentage >= 50) {
      return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    }
    if (requirement.coveragePercentage > 0) {
      return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    }
    return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
  }, [requirement.coveragePercentage]);

  const CoverageIcon = coverageStatus.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:border-primary/50',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="shrink-0 font-mono text-xs">
                {requirement.externalId}
              </Badge>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>

            {/* Title */}
            <h3 className="font-medium text-foreground line-clamp-2">
              {requirement.title}
            </h3>

            {/* Description */}
            {requirement.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {requirement.description}
              </p>
            )}

            {/* Coverage & Links */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {requirement.linkedTestCases.length} test cases
                </span>
              </div>
            </div>
          </div>

          {/* Coverage Badge */}
          <div
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg p-3',
              coverageStatus.bg
            )}
          >
            <CoverageIcon className={cn('h-5 w-5', coverageStatus.color)} />
            <span className={cn('text-lg font-bold', coverageStatus.color)}>
              {requirement.coveragePercentage.toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground">Coverage</span>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="mt-3">
          <Progress
            value={requirement.coveragePercentage}
            className="h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
};
