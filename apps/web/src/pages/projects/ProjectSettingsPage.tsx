import { type FC, useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { AlertCircle, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Alert,
  AlertDescription,
  Spinner,
  ConfirmDialog,
} from '@/components/ui';
import {
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/store/api/projectsApi';
import type { Project } from '@/types';

interface ProjectContextType {
  project: Project;
}

interface FormErrors {
  name?: string;
  description?: string;
}

/**
 * Project settings page with form and danger zone.
 */
export const ProjectSettingsPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<ProjectContextType>();
  const project = context?.project;

  const [updateProject, { isLoading: isUpdating, error: updateError }] =
    useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  // Track changes
  useEffect(() => {
    if (project) {
      const nameChanged = name !== project.name;
      const descChanged = description !== (project.description || '');
      setHasChanges(nameChanged || descChanged);
    }
  }, [name, description, project]);

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

    if (!validateForm() || !projectId) {
      return;
    }

    try {
      await updateProject({
        id: projectId,
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();
      setHasChanges(false);
    } catch {
      // Error is handled by RTK Query
    }
  };

  /**
   * Handles project deletion.
   */
  const handleDelete = async (): Promise<void> => {
    if (!projectId) return;

    try {
      await deleteProject(projectId).unwrap();
      navigate('/projects', { replace: true });
    } catch {
      // Error is handled by RTK Query
    }
  };

  /**
   * Gets error message from RTK Query error.
   */
  const getErrorMessage = (): string | undefined => {
    if (!updateError) return undefined;
    if (typeof updateError === 'object' && 'data' in updateError) {
      const data = updateError.data as Record<string, unknown>;
      if (typeof data?.['message'] === 'string') {
        return data['message'];
      }
    }
    return 'Failed to update project. Please try again.';
  };

  const apiError = getErrorMessage();

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your project's name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isUpdating}
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
                disabled={isUpdating}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating || !hasChanges}>
                {isUpdating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-foreground">Delete this project</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all test cases, runs, and results will be permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteConfirmName('');
        }}
        title="Delete project"
        description={
          <div className="space-y-4">
            <p>
              This action cannot be undone. This will permanently delete the{' '}
              <strong>{project.name}</strong> project and all associated data including:
            </p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>All test cases and test suites</li>
              <li>All test runs and results</li>
              <li>All milestones and test plans</li>
              <li>All team member associations</li>
            </ul>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Please type <strong>{project.name}</strong> to confirm:
              </p>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Enter project name"
                disabled={isDeleting}
              />
            </div>
          </div>
        }
        confirmText="Delete project"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmDisabled={deleteConfirmName !== project.name}
      />
    </div>
  );
};
