import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  EmptyState,
  Alert,
  AlertDescription,
  ConfirmDialog,
} from '@/components/ui';
import {
  TestRunCard,
  CreateRunDialog,
  type CreateRunFormValues,
} from '@/components/features/test-runs';
import {
  useGetTestRunsQuery,
  useCreateTestRunMutation,
  useDeleteTestRunMutation,
  useCloseTestRunMutation,
  type TestRunWithStats,
} from '@/store/api/testRunsApi';
import { useGetTestSuitesQuery } from '@/store/api/testSuitesApi';
import { useToast } from '@/hooks/useToast';

type StatusFilter = 'all' | 'active' | 'completed';

/**
 * Test Runs list page with filters and run cards.
 */
export const TestRunsListPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [runToDelete, setRunToDelete] = useState<TestRunWithStats | null>(null);
  const [page, setPage] = useState(1);

  // Queries
  const {
    data: runsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTestRunsQuery(
    { projectId: projectId!, page, pageSize: 20, search: search || undefined },
    { skip: !projectId }
  );

  const { data: suites = [] } = useGetTestSuitesQuery(projectId!, {
    skip: !projectId,
  });

  // Mutations
  const [createRunMutation, { isLoading: isCreating }] = useCreateTestRunMutation();
  const [deleteRunMutation, { isLoading: isDeleting }] = useDeleteTestRunMutation();
  const [closeRunMutation, { isLoading: isClosing }] = useCloseTestRunMutation();

  // Filter runs by status
  const filteredRuns = useMemo(() => {
    const runs = runsData?.items ?? [];
    if (statusFilter === 'all') return runs;
    if (statusFilter === 'active') return runs.filter((r) => !r.completedAt);
    if (statusFilter === 'completed') return runs.filter((r) => !!r.completedAt);
    return runs;
  }, [runsData?.items, statusFilter]);

  // Handlers
  const handleCreateRun = useCallback(
    async (values: CreateRunFormValues) => {
      try {
        await createRunMutation({
          projectId: projectId!,
          name: values.name,
          description: values.description,
          suiteId: values.suiteId || undefined,
          assigneeId: values.assigneeId || undefined,
        }).unwrap();
        toast({ title: 'Test run created', variant: 'success' });
        setShowCreateDialog(false);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create test run',
          variant: 'error',
        });
      }
    },
    [createRunMutation, projectId, toast]
  );

  const handleDeleteRun = useCallback(
    async () => {
      if (!runToDelete) return;
      try {
        await deleteRunMutation({
          projectId: projectId!,
          id: runToDelete.id,
        }).unwrap();
        toast({ title: 'Test run deleted', variant: 'success' });
        setRunToDelete(null);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete test run',
          variant: 'error',
        });
      }
    },
    [deleteRunMutation, projectId, runToDelete, toast]
  );

  const handleCloseRun = useCallback(
    async (run: TestRunWithStats) => {
      try {
        await closeRunMutation({
          projectId: projectId!,
          id: run.id,
        }).unwrap();
        toast({ title: 'Test run closed', variant: 'success' });
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to close test run',
          variant: 'error',
        });
      }
    },
    [closeRunMutation, projectId, toast]
  );

  // Error handling
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if ('status' in error) {
      const fetchError = error as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Test Runs</h1>
          <p className="text-muted-foreground">
            Manage and execute your test runs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Run
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <Alert variant="error">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search test runs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Runs</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Run cards grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredRuns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRuns.map((run) => (
            <TestRunCard
              key={run.id}
              run={run}
              projectId={projectId!}
              onDelete={setRunToDelete}
              onClose={handleCloseRun}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Filter className="h-12 w-12" />}
          title="No test runs found"
          description={
            search || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first test run to start executing tests.'
          }
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Run
            </Button>
          }
        />
      )}

      {/* Create run dialog */}
      <CreateRunDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        suites={suites}
        isSubmitting={isCreating}
        onSubmit={handleCreateRun}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!runToDelete}
        onOpenChange={(open) => !open && setRunToDelete(null)}
        title="Delete Test Run"
        description={`Are you sure you want to delete "${runToDelete?.name}"? This will also delete all test results. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteRun}
        isLoading={isDeleting}
      />
    </div>
  );
};
