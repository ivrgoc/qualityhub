/* eslint-disable react-refresh/only-export-components */
import { type FC } from 'react';
import { Outlet, useParams, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlayCircle, Settings, Users } from 'lucide-react';
import { Skeleton, Alert, AlertDescription } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useGetProjectQuery } from '@/store/api/projectsApi';

/**
 * Navigation tabs for project detail page.
 */
const projectTabs = [
  { path: '', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: 'test-cases', label: 'Test Cases', icon: FileText },
  { path: 'test-runs', label: 'Test Runs', icon: PlayCircle },
  { path: 'team', label: 'Team', icon: Users },
  { path: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Loading skeleton for project header.
 */
const ProjectHeaderSkeleton: FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-4 border-b">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-24" />
      ))}
    </div>
  </div>
);

/**
 * Project detail page with tabs navigation and nested routes.
 */
export const ProjectDetailPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading, error } = useGetProjectQuery(projectId!, {
    skip: !projectId,
  });

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <ProjectHeaderSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-7xl">
        <Alert variant="error">
          <AlertDescription>
            {error ? 'Failed to load project. Please try again.' : 'Project not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Project Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {projectTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet context={{ project }} />
    </div>
  );
};

/**
 * Hook to get project from outlet context.
 */
export function useProjectContext() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (window as any).__OUTLET_CONTEXT__;
  return context?.project;
}
