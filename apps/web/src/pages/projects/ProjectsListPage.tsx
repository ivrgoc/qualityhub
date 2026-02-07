import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban, RefreshCw } from 'lucide-react';
import { Button, Input, Skeleton, Alert, AlertDescription } from '@/components/ui';
import { ProjectCard, CreateProjectDialog } from '@/components/features/projects';
import { useGetProjectsWithStatsQuery } from '@/store/api/projectsApi';

/**
 * Loading skeleton for project cards grid.
 */
const ProjectsGridSkeleton: FC = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="rounded-lg border p-6">
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Projects list page with grid view and create button.
 */
export const ProjectsListPage: FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProjectsWithStatsQuery({ search: search || undefined });

  const projects = data?.items ?? [];

  /**
   * Handles successful project creation.
   */
  const handleProjectCreated = (projectId: string): void => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your test projects and team collaboration
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <AlertDescription>
            Failed to load projects. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <ProjectsGridSkeleton />
      ) : projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => navigate(`/projects/${project.id}/settings`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="mb-4 rounded-full bg-muted p-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? 'No projects match your search. Try a different term.'
              : 'Create your first project to start organizing your tests.'}
          </p>
          {!search && (
            <Button onClick={() => setShowCreateDialog(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          )}
        </div>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};
