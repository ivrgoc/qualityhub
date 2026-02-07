import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate, formatRelativeTime } from '@/utils/date';
import {
  Card,
  CardContent,
  Badge,
  Progress,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import type { MilestoneWithStats } from '@/store/api/milestonesApi';

/**
 * Props for the MilestoneCard component.
 */
export interface MilestoneCardProps {
  milestone: MilestoneWithStats;
  projectId: string;
  onEdit?: (milestone: MilestoneWithStats) => void;
  onDelete?: (milestone: MilestoneWithStats) => void;
  onComplete?: (milestone: MilestoneWithStats) => void;
  className?: string;
}

/**
 * Card component displaying a milestone summary.
 * Shows name, due date, progress bar, and stats.
 */
export const MilestoneCard: FC<MilestoneCardProps> = ({
  milestone,
  projectId,
  onEdit,
  onDelete,
  onComplete,
  className,
}) => {
  const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && !milestone.isCompleted;
  const progress = milestone.stats.totalRuns > 0
    ? Math.round((milestone.stats.completedRuns / milestone.stats.totalRuns) * 100)
    : 0;
  const passRate = milestone.stats.totalTests > 0
    ? Math.round((milestone.stats.passedTests / milestone.stats.totalTests) * 100)
    : 0;

  return (
    <Card className={cn('group hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              to={`/projects/${projectId}/milestones/${milestone.id}`}
              className="block truncate font-medium hover:text-primary hover:underline"
            >
              {milestone.name}
            </Link>
            {milestone.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {milestone.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {milestone.isCompleted ? (
              <Badge variant="secondary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge variant="destructive">Overdue</Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(milestone)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onComplete && !milestone.isCompleted && (
                  <DropdownMenuItem onClick={() => onComplete(milestone)}>
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(milestone)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {milestone.stats.totalRuns} runs
            </span>
            {milestone.stats.totalTests > 0 && (
              <span className="text-green-600 dark:text-green-500">
                {passRate}% pass rate
              </span>
            )}
          </div>
        </div>

        {/* Due date */}
        {milestone.dueDate && (
          <div className={cn(
            'mt-3 flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-600 dark:text-red-500' : 'text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            <span>
              {milestone.isCompleted
                ? `Completed ${formatRelativeTime(milestone.completedAt!)}`
                : `Due ${formatDate(milestone.dueDate)}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
