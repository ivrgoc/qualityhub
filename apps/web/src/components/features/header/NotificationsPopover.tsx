import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from '@/components/ui';
import { cn } from '@/utils/cn';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

const notificationIcons: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
};

const notificationStyles: Record<NotificationType, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export interface NotificationsPopoverProps {
  className?: string;
  /** Notifications to display */
  notifications?: Notification[];
  /** Callback when a notification is marked as read */
  onMarkAsRead?: (id: string) => void;
  /** Callback when all notifications are marked as read */
  onMarkAllAsRead?: () => void;
  /** Callback when a notification is dismissed */
  onDismiss?: (id: string) => void;
}

/**
 * Notifications popover component that displays a list of notifications.
 * Shows an unread count badge and allows marking notifications as read.
 */
export const NotificationsPopover: FC<NotificationsPopoverProps> = ({
  className,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              size="sm"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={onMarkAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const iconStyle = notificationStyles[notification.type];

                const content = (
                  <div
                    className={cn(
                      'group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                      !notification.read && 'bg-muted/30'
                    )}
                  >
                    <div className={cn('mt-0.5 shrink-0', iconStyle)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm',
                            !notification.read && 'font-medium'
                          )}
                        >
                          {notification.title}
                        </p>
                        {onDismiss && (
                          <span
                            role="button"
                            tabIndex={0}
                            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDismiss(notification.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                onDismiss(notification.id);
                              }
                            }}
                            aria-label="Dismiss notification"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );

                return (
                  <li key={notification.id}>
                    {notification.href ? (
                      <Link
                        to={notification.href}
                        onClick={() => {
                          onMarkAsRead?.(notification.id);
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => onMarkAsRead?.(notification.id)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Link
              to="/notifications"
              className="block text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
