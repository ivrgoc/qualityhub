import { type FC, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  PlayCircle,
  Flag,
  ClipboardList,
  Users,
  Search,
  Filter,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { cn } from '@/utils/cn';

/**
 * Props for empty state components
 */
interface BaseEmptyStateProps {
  className?: string;
}

/**
 * Empty state for no projects
 */
export const NoProjectsEmptyState: FC<
  BaseEmptyStateProps & {
    onCreateProject?: () => void;
  }
> = ({ className, onCreateProject }) => (
  <EmptyState
    icon={<FolderKanban />}
    title="No projects yet"
    description="Create your first project to start organizing your test cases and test runs."
    action={
      onCreateProject && (
        <Button onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Create project
        </Button>
      )
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no test cases
 */
export const NoTestCasesEmptyState: FC<
  BaseEmptyStateProps & {
    onCreateTestCase?: () => void;
    onGenerateWithAI?: () => void;
    projectId?: string;
  }
> = ({ className, onCreateTestCase, onGenerateWithAI, projectId }) => (
  <EmptyState
    icon={<FileText />}
    title="No test cases yet"
    description="Add your first test case manually or generate them with AI from your requirements."
    action={
      <div className="flex flex-wrap justify-center gap-3">
        {onCreateTestCase && (
          <Button onClick={onCreateTestCase}>
            <Plus className="mr-2 h-4 w-4" />
            Add test case
          </Button>
        )}
        {onGenerateWithAI && (
          <Button variant="outline" onClick={onGenerateWithAI}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        )}
      </div>
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no test runs
 */
export const NoTestRunsEmptyState: FC<
  BaseEmptyStateProps & {
    onCreateRun?: () => void;
    projectId?: string;
  }
> = ({ className, onCreateRun, projectId }) => (
  <EmptyState
    icon={<PlayCircle />}
    title="No test runs yet"
    description="Start a test run to execute your test cases and track results."
    action={
      onCreateRun && (
        <Button onClick={onCreateRun}>
          <Plus className="mr-2 h-4 w-4" />
          Start test run
        </Button>
      )
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no milestones
 */
export const NoMilestonesEmptyState: FC<
  BaseEmptyStateProps & {
    onCreateMilestone?: () => void;
  }
> = ({ className, onCreateMilestone }) => (
  <EmptyState
    icon={<Flag />}
    title="No milestones yet"
    description="Create milestones to track release targets and test progress."
    action={
      onCreateMilestone && (
        <Button onClick={onCreateMilestone}>
          <Plus className="mr-2 h-4 w-4" />
          Create milestone
        </Button>
      )
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no requirements
 */
export const NoRequirementsEmptyState: FC<
  BaseEmptyStateProps & {
    onAddRequirement?: () => void;
    onImportRequirements?: () => void;
  }
> = ({ className, onAddRequirement, onImportRequirements }) => (
  <EmptyState
    icon={<ClipboardList />}
    title="No requirements yet"
    description="Add requirements to track coverage and link them to your test cases."
    action={
      <div className="flex flex-wrap justify-center gap-3">
        {onAddRequirement && (
          <Button onClick={onAddRequirement}>
            <Plus className="mr-2 h-4 w-4" />
            Add requirement
          </Button>
        )}
        {onImportRequirements && (
          <Button variant="outline" onClick={onImportRequirements}>
            <Upload className="mr-2 h-4 w-4" />
            Import from Jira
          </Button>
        )}
      </div>
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no team members
 */
export const NoTeamMembersEmptyState: FC<
  BaseEmptyStateProps & {
    onInviteMember?: () => void;
  }
> = ({ className, onInviteMember }) => (
  <EmptyState
    icon={<Users />}
    title="No team members yet"
    description="Invite team members to collaborate on testing."
    action={
      onInviteMember && (
        <Button onClick={onInviteMember}>
          <Plus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      )
    }
    className={cn('rounded-lg border border-dashed', className)}
  />
);

/**
 * Empty state for no search results
 */
export const NoSearchResultsEmptyState: FC<
  BaseEmptyStateProps & {
    query?: string;
    onClearSearch?: () => void;
  }
> = ({ className, query, onClearSearch }) => (
  <EmptyState
    icon={<Search />}
    title="No results found"
    description={
      query
        ? `No results match "${query}". Try different keywords.`
        : 'No results found. Try adjusting your search.'
    }
    action={
      onClearSearch && (
        <Button variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      )
    }
    className={className}
  />
);

/**
 * Empty state for no filter results
 */
export const NoFilterResultsEmptyState: FC<
  BaseEmptyStateProps & {
    onClearFilters?: () => void;
  }
> = ({ className, onClearFilters }) => (
  <EmptyState
    icon={<Filter />}
    title="No matching items"
    description="No items match your current filters. Try adjusting your filter criteria."
    action={
      onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )
    }
    className={className}
  />
);

/**
 * Empty state for no activity
 */
export const NoActivityEmptyState: FC<BaseEmptyStateProps> = ({ className }) => (
  <EmptyState
    icon={<PlayCircle />}
    title="No recent activity"
    description="Activity will appear here once you start creating and executing tests."
    className={className}
    size="sm"
  />
);

/**
 * Empty state for no assigned tests
 */
export const NoAssignedTestsEmptyState: FC<
  BaseEmptyStateProps & {
    projectId?: string;
  }
> = ({ className, projectId }) => (
  <EmptyState
    icon={<FileText />}
    title="No tests assigned"
    description="You don't have any tests assigned to you. You're all caught up!"
    action={
      projectId && (
        <Button variant="outline" asChild>
          <Link to={`/projects/${projectId}/runs`}>Browse test runs</Link>
        </Button>
      )
    }
    className={className}
    size="sm"
  />
);

/**
 * Empty state for no notifications
 */
export const NoNotificationsEmptyState: FC<BaseEmptyStateProps> = ({ className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-8 text-center',
      className
    )}
  >
    <p className="text-sm text-muted-foreground">No notifications</p>
  </div>
);

/**
 * Empty state for empty section
 */
export const EmptySectionState: FC<
  BaseEmptyStateProps & {
    sectionName?: string;
    onAddTestCase?: () => void;
  }
> = ({ className, sectionName, onAddTestCase }) => (
  <EmptyState
    icon={<FileText />}
    title={`No test cases in ${sectionName || 'this section'}`}
    description="Add test cases to organize your tests."
    action={
      onAddTestCase && (
        <Button size="sm" variant="outline" onClick={onAddTestCase}>
          <Plus className="mr-2 h-4 w-4" />
          Add test case
        </Button>
      )
    }
    className={className}
    size="sm"
  />
);
