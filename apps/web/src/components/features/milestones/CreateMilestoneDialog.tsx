import { type FC, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Textarea,
} from '@/components/ui';
import type { MilestoneWithStats } from '@/store/api/milestonesApi';

/**
 * Zod schema for milestone form validation.
 */
const milestoneFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name is too long'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

/**
 * Type for milestone form values.
 */
export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

/**
 * Props for the CreateMilestoneDialog component.
 */
export interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: MilestoneWithStats | null;
  isSubmitting?: boolean;
  onSubmit: (values: MilestoneFormValues) => Promise<void>;
  className?: string;
}

/**
 * Dialog for creating or editing a milestone.
 */
export const CreateMilestoneDialog: FC<CreateMilestoneDialogProps> = ({
  open,
  onOpenChange,
  milestone,
  isSubmitting,
  onSubmit,
  className,
}) => {
  const isEditing = !!milestone;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      name: milestone?.name ?? '',
      description: milestone?.description ?? '',
      startDate: milestone?.startDate?.split('T')[0] ?? '',
      dueDate: milestone?.dueDate?.split('T')[0] ?? '',
    },
  });

  // Reset form when dialog opens/closes or milestone changes
  useEffect(() => {
    if (open) {
      reset({
        name: milestone?.name ?? '',
        description: milestone?.description ?? '',
        startDate: milestone?.startDate?.split('T')[0] ?? '',
        dueDate: milestone?.dueDate?.split('T')[0] ?? '',
      });
    }
  }, [open, milestone, reset]);

  const handleFormSubmit = useCallback(
    async (values: MilestoneFormValues) => {
      await onSubmit(values);
      reset();
    },
    [onSubmit, reset]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', className)}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Milestone' : 'Create Milestone'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update milestone details.'
                : 'Create a new milestone to track project progress.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., v2.0 Release"
                error={errors.name?.message}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            {/* Date range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium">
                  Due Date
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
