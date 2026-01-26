import { type FC } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  TestTube2,
  PlayCircle,
  FileBarChart,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, clearCredentials } from '@/store/slices/authSlice';
import { useGetProjectsQuery } from '@/store/api/projectsApi';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Test Cases', href: '/test-cases', icon: TestTube2 },
  { label: 'Test Runs', href: '/test-runs', icon: PlayCircle },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export interface SidebarProps {
  className?: string;
}

/**
 * Sidebar component with navigation links, project switcher, and user avatar.
 * Uses the sidebar color tokens for consistent styling.
 */
export const Sidebar: FC<SidebarProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery({ pageSize: 10 });
  const projects = projectsData?.items ?? [];

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-sidebar-primary transition-opacity hover:opacity-80"
        >
          QualityHub
        </Link>
      </div>

      {/* Project Switcher */}
      <div className="border-b border-sidebar-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 h-auto text-left font-normal hover:bg-sidebar-accent"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {projects[0]?.name.charAt(0).toUpperCase() ?? 'P'}
                </div>
                <div className="flex flex-col min-w-0">
                  {projectsLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <>
                      <span className="truncate text-sm font-medium text-sidebar-foreground">
                        {projects[0]?.name ?? 'Select Project'}
                      </span>
                      <span className="text-xs text-sidebar-foreground/60">
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[232px]">
            <DropdownMenuLabel>Projects</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projectsLoading ? (
              <div className="px-2 py-1.5">
                <Skeleton className="h-8 w-full" />
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  className="cursor-pointer"
                  asChild
                >
                  <Link to={`/projects/${project.id}`}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold mr-2">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{project.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No projects yet
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border">
        {/* Bottom Navigation */}
        <div className="px-3 py-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User Avatar Section */}
        <div className="border-t border-sidebar-border px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-2 h-auto hover:bg-sidebar-accent"
              >
                <Avatar size="sm" name={user?.name} className="h-8 w-8" />
                <div className="ml-2 flex flex-col items-start min-w-0">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.name ?? 'User'}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user?.email ?? 'user@example.com'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-[232px]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/settings">
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
      </div>
    </aside>
  );
};
