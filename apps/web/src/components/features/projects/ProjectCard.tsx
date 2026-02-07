import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlayCircle, Users, TrendingUp, MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/utils/cn';
import type { ProjectWithStats } from '@/store/api/projectsApi';

export interface ProjectCardProps {
  /** Project data with stats */
  project: ProjectWithStats;
  /** Callback when edit is clicked */
  onEdit?: (project: ProjectWithStats) => void;
  /** Callback when delete is clicked */
  onDelete?: (project: ProjectWithStats) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the pass rate badge variant.
 */
function getPassRateVariant(passRate: number): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (passRate >= 80) return 'success';
  if (passRate >= 50) return 'warning';
  if (passRate > 0) return 'destructive';
  return 'secondary';
}

/**
 * Project card component for displaying project summary in a grid.
 */
export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <Card className={cn('group relative transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="flex-1 min-w-0"
          >
            <CardTitle className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/projects/${project.id}`}>View project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/projects/${project.id}/settings`}>Settings</Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(project)}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Test Cases */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {project.stats.testCases}
              </p>
              <p className="text-xs text-muted-foreground">Test Cases</p>
            </div>
          </div>

          {/* Test Runs */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30">
              <PlayCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {project.stats.testRuns}
              </p>
              <p className="text-xs text-muted-foreground">Test Runs</p>
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {project.memberCount}
              </p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>

          {/* Pass Rate */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <Badge variant={getPassRateVariant(project.stats.passRate)}>
                {project.stats.passRate}%
              </Badge>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
