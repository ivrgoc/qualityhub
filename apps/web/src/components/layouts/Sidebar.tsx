import { type FC } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  TestTube2,
  PlayCircle,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';
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
 * Sidebar component with navigation links for the dashboard layout.
 * Uses the sidebar color tokens for consistent styling.
 */
export const Sidebar: FC<SidebarProps> = ({ className }) => {
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

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border px-3 py-4">
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
    </aside>
  );
};
