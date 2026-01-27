import { type FC, type ReactNode, useCallback, useRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { preloadRoutes } from '@/router';

type PreloadableRoute = keyof typeof preloadRoutes;

export interface PreloadLinkProps extends Omit<LinkProps, 'to'> {
  /** The route to navigate to */
  to: string;
  /** Route name for preloading (if applicable) */
  preload?: PreloadableRoute;
  /** Children to render */
  children: ReactNode;
}

/**
 * Link component that preloads the target route on mouse enter.
 * This improves perceived navigation speed by loading the code before click.
 */
export const PreloadLink: FC<PreloadLinkProps> = ({
  to,
  preload,
  children,
  onMouseEnter,
  onTouchStart,
  ...props
}) => {
  const preloadedRef = useRef(false);

  const triggerPreload = useCallback(() => {
    if (preload && !preloadedRef.current) {
      preloadedRef.current = true;
      preloadRoutes[preload]();
    }
  }, [preload]);

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      triggerPreload();
      onMouseEnter?.(event);
    },
    [triggerPreload, onMouseEnter]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLAnchorElement>) => {
      triggerPreload();
      onTouchStart?.(event);
    },
    [triggerPreload, onTouchStart]
  );

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
};

/**
 * Detect route name from path for automatic preloading.
 */
export const getPreloadRouteFromPath = (path: string): PreloadableRoute | undefined => {
  // Match exact paths
  const exactMatches: Record<string, PreloadableRoute> = {
    '/dashboard': 'dashboard',
    '/projects': 'projects',
    '/settings': 'settings',
    '/login': 'login',
    '/register': 'register',
  };

  if (exactMatches[path]) {
    return exactMatches[path];
  }

  // Match patterns
  if (path.match(/^\/projects\/[^/]+$/)) {
    return 'projectOverview';
  }
  if (path.match(/^\/projects\/[^/]+\/test-cases/)) {
    return 'testCases';
  }
  if (path.match(/^\/projects\/[^/]+\/runs\/[^/]+\/execute/)) {
    return 'testExecution';
  }
  if (path.match(/^\/projects\/[^/]+\/runs/)) {
    return 'testRuns';
  }
  if (path.match(/^\/projects\/[^/]+\/milestones/)) {
    return 'milestones';
  }
  if (path.match(/^\/projects\/[^/]+\/reports/)) {
    return 'reports';
  }
  if (path.match(/^\/projects\/[^/]+\/requirements/)) {
    return 'requirements';
  }

  return undefined;
};

/**
 * Auto-preload link that detects the preload route from the path.
 */
export const AutoPreloadLink: FC<Omit<PreloadLinkProps, 'preload'>> = ({
  to,
  ...props
}) => {
  const preload = getPreloadRouteFromPath(to);
  return <PreloadLink to={to} preload={preload} {...props} />;
};
