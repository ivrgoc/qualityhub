import { type FC, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import type { TestSuite } from '@/store/api/testSuitesApi';

/**
 * Zod schema for create run form validation.
 */
const createRunFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name is too long'),
  description: z.string().optional(),
  suiteId: z.string().optional(),
  assigneeId: z.string().optional(),
});

/**
 * Type for create run form values.
 */
export type CreateRunFormValues = z.infer<typeof createRunFormSchema>;

/**
 * User option for assignee select.
 */
export interface UserOption {
  id: string;
  name: string;
  email: string;
}

/**
 * Props for the CreateRunDialog component.
 */
export interface CreateRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suites: TestSuite[];
  users?: UserOption[];
  isSubmitting?: boolean;
  onSubmit: (values: CreateRunFormValues) => Promise<void>;
  className?: string;
}

/**
 * Dialog for creating a new test run.
 * Allows setting name, description, suite, and assignee.
 */
export const CreateRunDialog: FC<CreateRunDialogProps> = ({
  open,
  onOpenChange,
  suites,
  users = [],
  isSubmitting,
  onSubmit,
  className,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRunFormValues>({
    resolver: zodResolver(createRunFormSchema),
    defaultValues: {
      name: '',
      description: '',
      suiteId: '',
      assigneeId: '',
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = useCallback(
    async (values: CreateRunFormValues) => {
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
            <DialogTitle>Create Test Run</DialogTitle>
            <DialogDescription>
              Create a new test run to execute test cases.
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
                placeholder="e.g., Sprint 24 Regression"
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

            {/* Suite Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Test Suite</label>
              <Controller
                control={control}
                name="suiteId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test suite (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All test cases</SelectItem>
                      {suites.map((suite) => (
                        <SelectItem key={suite.id} value={suite.id}>
                          {suite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Select a suite to include only its test cases, or leave empty for all.
              </p>
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Assignee</label>
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
