import { type FC, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button, Input, Textarea, Alert, AlertDescription, Spinner } from '@/components/ui';
import { useCreateProjectMutation } from '@/store/api/projectsApi';

export interface CreateProjectDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void;
  /** Callback when project is created */
  onSuccess?: (projectId: string) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
}

/**
 * Dialog for creating a new project.
 */
export const CreateProjectDialog: FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [createProject, { isLoading, error }] = useCreateProjectMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Resets the form state.
   */
  const resetForm = (): void => {
    setName('');
    setDescription('');
    setErrors({});
  };

  /**
   * Validates the form.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();

      resetForm();
      onOpenChange(false);
      onSuccess?.(project.id);
    } catch {
      // Error is handled by RTK Query
    }
  };

  /**
   * Handles dialog close.
   */
  const handleClose = (): void => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  /**
   * Gets error message from RTK Query error.
   */
  const getErrorMessage = (): string | undefined => {
    if (!error) return undefined;
    if (typeof error === 'object' && 'data' in error) {
      const data = error.data as Record<string, unknown>;
      if (typeof data?.['message'] === 'string') {
        return data['message'];
      }
    }
    return 'Failed to create project. Please try again.';
  };

  const apiError = getErrorMessage();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Add a new project to organize your test cases and runs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* API Error */}
            {apiError && (
              <Alert variant="error" icon={<AlertCircle className="h-4 w-4" />}>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project name <span className="text-destructive">*</span>
              </label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={errors.name}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium">
                Description{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                id="project-description"
                placeholder="Describe your project..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                disabled={isLoading}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
