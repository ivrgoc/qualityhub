import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, RefreshCw, Flag } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
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
  MilestoneCard,
  CreateMilestoneDialog,
  type MilestoneFormValues,
} from '@/components/features/milestones';
import {
  useGetMilestonesQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  type MilestoneWithStats,
} from '@/store/api/milestonesApi';
import { useToast } from '@/hooks/useToast';

type StatusFilter = 'all' | 'active' | 'completed';

/**
 * Milestones page with timeline/list view.
 */
export const MilestonesPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();

  // State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<MilestoneWithStats | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<MilestoneWithStats | null>(null);

  // Queries
  const {
    data: milestones = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMilestonesQuery(projectId!, { skip: !projectId });

  // Mutations
  const [createMilestoneMutation, { isLoading: isCreating }] = useCreateMilestoneMutation();
  const [updateMilestoneMutation, { isLoading: isUpdating }] = useUpdateMilestoneMutation();
  const [deleteMilestoneMutation, { isLoading: isDeleting }] = useDeleteMilestoneMutation();

  // Filter milestones by status
  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'all') return milestones;
    if (statusFilter === 'active') return milestones.filter((m) => !m.isCompleted);
    if (statusFilter === 'completed') return milestones.filter((m) => m.isCompleted);
    return milestones;
  }, [milestones, statusFilter]);

  // Sort by due date (upcoming first)
  const sortedMilestones = useMemo(() => {
    return [...filteredMilestones].sort((a, b) => {
      // Completed milestones at the bottom
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Sort by due date
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [filteredMilestones]);

  // Handlers
  const handleCreateMilestone = useCallback(
    async (values: MilestoneFormValues) => {
      try {
        await createMilestoneMutation({
          projectId: projectId!,
          name: values.name,
          description: values.description,
          startDate: values.startDate || undefined,
          dueDate: values.dueDate || undefined,
        }).unwrap();
        toast({ title: 'Milestone created', variant: 'success' });
        setShowCreateDialog(false);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create milestone',
          variant: 'error',
        });
      }
    },
    [createMilestoneMutation, projectId, toast]
  );

  const handleUpdateMilestone = useCallback(
    async (values: MilestoneFormValues) => {
      if (!milestoneToEdit) return;
      try {
        await updateMilestoneMutation({
          projectId: projectId!,
          id: milestoneToEdit.id,
          name: values.name,
          description: values.description,
          startDate: values.startDate || undefined,
          dueDate: values.dueDate || undefined,
        }).unwrap();
        toast({ title: 'Milestone updated', variant: 'success' });
        setMilestoneToEdit(null);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update milestone',
          variant: 'error',
        });
      }
    },
    [updateMilestoneMutation, projectId, milestoneToEdit, toast]
  );

  const handleDeleteMilestone = useCallback(async () => {
    if (!milestoneToDelete) return;
    try {
      await deleteMilestoneMutation({
        projectId: projectId!,
        id: milestoneToDelete.id,
      }).unwrap();
      toast({ title: 'Milestone deleted', variant: 'success' });
      setMilestoneToDelete(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete milestone',
        variant: 'error',
      });
    }
  }, [deleteMilestoneMutation, projectId, milestoneToDelete, toast]);

  const handleCompleteMilestone = useCallback(
    async (milestone: MilestoneWithStats) => {
      try {
        await updateMilestoneMutation({
          projectId: projectId!,
          id: milestone.id,
          isCompleted: true,
        }).unwrap();
        toast({ title: 'Milestone marked complete', variant: 'success' });
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to complete milestone',
          variant: 'error',
        });
      }
    },
    [updateMilestoneMutation, projectId, toast]
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
          <h1 className="text-2xl font-semibold">Milestones</h1>
          <p className="text-muted-foreground">
            Track project progress and release schedules
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
            New Milestone
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Milestones</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Milestone cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : sortedMilestones.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              projectId={projectId!}
              onEdit={setMilestoneToEdit}
              onDelete={setMilestoneToDelete}
              onComplete={handleCompleteMilestone}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Flag className="h-12 w-12" />}
          title="No milestones found"
          description={
            statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first milestone to start tracking progress.'
          }
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Milestone
            </Button>
          }
        />
      )}

      {/* Create/Edit dialog */}
      <CreateMilestoneDialog
        open={showCreateDialog || !!milestoneToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setMilestoneToEdit(null);
          }
        }}
        milestone={milestoneToEdit}
        isSubmitting={isCreating || isUpdating}
        onSubmit={milestoneToEdit ? handleUpdateMilestone : handleCreateMilestone}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!milestoneToDelete}
        onOpenChange={(open) => !open && setMilestoneToDelete(null)}
        title="Delete Milestone"
        description={`Are you sure you want to delete "${milestoneToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteMilestone}
        isLoading={isDeleting}
      />
    </div>
  );
};
