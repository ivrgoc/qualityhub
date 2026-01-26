import { type FC, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  Breadcrumbs,
  SearchInput,
  NotificationsPopover,
  type Notification,
} from '@/components/features/header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, clearCredentials } from '@/store/slices/authSlice';
import { cn } from '@/utils/cn';

// Mock notifications for demonstration - in production this would come from API/Redux
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Test run completed',
    message: 'Sprint 23 regression tests completed with 98% pass rate.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    href: '/test-runs/1',
  },
  {
    id: '2',
    type: 'warning',
    title: 'New defect assigned',
    message: 'DEF-1234: Login button not working on Safari has been assigned to you.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    href: '/defects/1234',
  },
  {
    id: '3',
    type: 'info',
    title: 'Project milestone approaching',
    message: 'Release v2.5 milestone is due in 3 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    href: '/milestones/1',
  },
];

export interface HeaderProps {
  className?: string;
}

/**
 * Header component with breadcrumbs, search, notifications, and user menu
 * for the dashboard layout.
 */
export const Header: FC<HeaderProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  // Local state for notifications - in production this would be in Redux
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  const handleSearch = useCallback((query: string): void => {
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }, [navigate]);

  const handleMarkNotificationAsRead = useCallback((id: string): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback((): void => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDismissNotification = useCallback((id: string): void => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-border bg-background px-6',
        className
      )}
    >
      {/* Left side - breadcrumbs */}
      <div className="flex items-center gap-4">
        <Breadcrumbs />
      </div>

      {/* Right side - search, notifications, and user menu */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <SearchInput
          placeholder="Search tests, projects..."
          onSearch={handleSearch}
        />

        {/* Notifications popover */}
        <NotificationsPopover
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onDismiss={handleDismissNotification}
        />

        {/* User dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar size="sm" name={user?.name} className="h-9 w-9" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
