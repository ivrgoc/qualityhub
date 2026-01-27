import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Checkbox, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import type { TodoItem } from '@/store/api/dashboardApi';

export interface TodoListProps {
  /** Todo items to display */
  items: TodoItem[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when a todo is marked complete */
  onComplete?: (todoId: string) => void;
  /** Whether completing action is in progress */
  isCompleting?: boolean;
  /** Maximum number of items to show */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the badge variant for a priority.
 */
function getPriorityVariant(priority: TodoItem['priority']): 'destructive' | 'warning' | 'secondary' | 'outline' {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Returns the priority label.
 */
function getPriorityLabel(priority: TodoItem['priority']): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Loading skeleton for todo list.
 */
const TodoListSkeleton: FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Todo list component for assigned tests.
 */
export const TodoList: FC<TodoListProps> = ({
  items,
  isLoading = false,
  onComplete,
  isCompleting = false,
  maxItems = 10,
  className,
}) => {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">My Assigned Tests</CardTitle>
          {items.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {items.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TodoListSkeleton />
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No tests assigned</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-start gap-3 rounded-lg border p-3 transition-colors',
                  'hover:bg-muted/50'
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  id={`todo-${item.id}`}
                  className="mt-0.5"
                  disabled={isCompleting}
                  onCheckedChange={() => onComplete?.(item.id)}
                  aria-label={`Mark "${item.testCaseTitle}" as complete`}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/projects/${item.projectId}/runs/${item.testRunId}`}
                    className="block"
                  >
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {item.testCaseTitle}
                    </p>
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{item.testRunName}</span>
                    <span className="text-border">•</span>
                    <span className="truncate">{item.projectName}</span>
                    {item.dueDate && (
                      <>
                        <span className="text-border">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(item.dueDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority Badge */}
                <Badge
                  variant={getPriorityVariant(item.priority)}
                  className="shrink-0 text-xs"
                >
                  {getPriorityLabel(item.priority)}
                </Badge>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}

            {/* Show more link */}
            {remainingCount > 0 && (
              <Link
                to="/my-tests"
                className="block py-2 text-center text-sm text-primary hover:underline"
              >
                View {remainingCount} more assigned tests
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
