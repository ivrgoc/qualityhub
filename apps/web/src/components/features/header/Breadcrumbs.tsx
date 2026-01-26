import { type FC, useMemo, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface RouteConfig {
  label: string;
  /** If true, this segment is a dynamic ID and should be displayed differently */
  isDynamic?: boolean;
}

/** Route label mapping for breadcrumb display */
const routeLabels: Record<string, RouteConfig> = {
  dashboard: { label: 'Dashboard' },
  projects: { label: 'Projects' },
  'test-cases': { label: 'Test Cases' },
  'test-runs': { label: 'Test Runs' },
  reports: { label: 'Reports' },
  settings: { label: 'Settings' },
  profile: { label: 'Profile' },
  new: { label: 'Create New' },
  edit: { label: 'Edit' },
};

export interface BreadcrumbsProps {
  className?: string;
  /** Optional custom items to override auto-generated breadcrumbs */
  items?: BreadcrumbItem[];
  /** Whether to show the home icon for root */
  showHomeIcon?: boolean;
}

/**
 * Breadcrumbs component that auto-generates navigation from the current URL path.
 * Can also accept custom items for more specific labeling.
 */
export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  className,
  items: customItems,
  showHomeIcon = true,
}) => {
  const location = useLocation();

  const items = useMemo<BreadcrumbItem[]>(() => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment !== '');

    if (pathSegments.length === 0) {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const routeConfig = routeLabels[segment];

      // Check if this looks like a UUID/ID
      const isId = /^[0-9a-f-]{8,}$/i.test(segment);

      let label: string;
      if (routeConfig) {
        label = routeConfig.label;
      } else if (isId) {
        // For IDs, we truncate and show a short version
        label = `#${segment.slice(0, 8)}`;
      } else {
        // Capitalize first letter of unknown segments
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    });

    return breadcrumbs;
  }, [location.pathname, customItems]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {/* Home link */}
        {showHomeIcon && (
          <>
            <li>
              <Link
                to="/dashboard"
                className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dashboard"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            {items.length > 0 && (
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </li>
            )}
          </>
        )}

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <Fragment key={item.href}>
            <li>
              {item.isCurrentPage ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </li>
            {index < items.length - 1 && (
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};
