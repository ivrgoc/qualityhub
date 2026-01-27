import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Play,
  CheckCircle2,
  PenLine,
  ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Avatar, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import type { ActivityItem } from '@/store/api/dashboardApi';

export interface ActivityFeedProps {
  /** Activity items to display */
  items: ActivityItem[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Maximum number of items to show */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the icon for an activity type.
 */
function getActivityIcon(type: ActivityItem['type']): React.ReactNode {
  switch (type) {
    case 'test_created':
      return <FileText className="h-4 w-4" />;
    case 'test_updated':
      return <PenLine className="h-4 w-4" />;
    case 'run_started':
      return <Play className="h-4 w-4" />;
    case 'run_completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'result_added':
      return <ClipboardCheck className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

/**
 * Returns the color for an activity type.
 */
function getActivityColor(type: ActivityItem['type']): string {
  switch (type) {
    case 'test_created':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'test_updated':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'run_started':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'run_completed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'result_added':
      return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Loading skeleton for activity feed.
 */
const ActivityFeedSkeleton: FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Activity feed component showing recent actions.
 */
export const ActivityFeed: FC<ActivityFeedProps> = ({
  items,
  isLoading = false,
  maxItems = 10,
  className,
}) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : displayItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                {/* Activity Type Icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    getActivityColor(item.type)
                  )}
                >
                  {getActivityIcon(item.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{item.user.name}</span>{' '}
                    <span className="text-muted-foreground">{item.message}</span>
                    {item.project && (
                      <>
                        {' '}
                        in{' '}
                        <Link
                          to={`/projects/${item.project.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.project.name}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>

                {/* User Avatar */}
                <Avatar
                  name={item.user.name}
                  src={item.user.avatarUrl}
                  size="sm"
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
