import { type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Bell } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, clearCredentials } from '@/store/slices/authSlice';
import { cn } from '@/utils/cn';

export interface HeaderProps {
  className?: string;
}

/**
 * Header component with user menu and notifications for the dashboard layout.
 */
export const Header: FC<HeaderProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-border bg-background px-6',
        className
      )}
    >
      {/* Left side - can be used for breadcrumbs or page title */}
      <div className="flex items-center gap-4">
        {/* Placeholder for breadcrumbs - can be extended later */}
      </div>

      {/* Right side - notifications and user menu */}
      <div className="flex items-center gap-4">
        {/* Notifications button */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

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
