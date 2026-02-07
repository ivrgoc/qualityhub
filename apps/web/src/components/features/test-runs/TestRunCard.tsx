import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Play, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import {
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { RunProgress } from './RunProgress';
import type { TestRunWithStats } from '@/store/api/testRunsApi';

/**
 * Props for the TestRunCard component.
 */
export interface TestRunCardProps {
  run: TestRunWithStats;
  projectId: string;
  assigneeName?: string;
  onEdit?: (run: TestRunWithStats) => void;
  onDelete?: (run: TestRunWithStats) => void;
  onClose?: (run: TestRunWithStats) => void;
  className?: string;
}

/**
 * Card component displaying a test run summary.
 * Shows name, progress bar, pass rate, assignee, and actions.
 */
export const TestRunCard: FC<TestRunCardProps> = ({
  run,
  projectId,
  assigneeName,
  onEdit,
  onDelete,
  onClose,
  className,
}) => {
  const isCompleted = !!run.completedAt;
  const passRate = run.stats.total > 0
    ? Math.round((run.stats.passed / run.stats.total) * 100)
    : 0;
  const completedCount = run.stats.total - run.stats.untested;

  return (
    <Card className={cn('group hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              to={`/projects/${projectId}/runs/${run.id}`}
              className="block truncate font-medium hover:text-primary hover:underline"
            >
              {run.name}
            </Link>
            {run.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {run.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? 'secondary' : 'default'}>
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3 w-3" />
                  In Progress
                </>
              )}
            </Badge>
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
                <DropdownMenuItem asChild>
                  <Link to={`/projects/${projectId}/runs/${run.id}/execute`}>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Tests
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(run)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onClose && !isCompleted && (
                  <DropdownMenuItem onClick={() => onClose(run)}>
                    Close Run
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(run)}
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
          <RunProgress stats={run.stats} size="sm" />
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>
              {completedCount}/{run.stats.total} tests
            </span>
            <span className="text-green-600 dark:text-green-500 font-medium">
              {passRate}% pass rate
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          {/* Assignee */}
          {run.assigneeId && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {assigneeName?.[0] ?? <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <span>{assigneeName ?? 'Assigned'}</span>
            </div>
          )}
          {!run.assigneeId && <div />}

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {isCompleted
                ? `Completed ${formatRelativeTime(run.completedAt!)}`
                : run.startedAt
                ? `Started ${formatRelativeTime(run.startedAt)}`
                : `Created ${formatRelativeTime(run.createdAt)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
