import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Progress,
  ConfirmDialog,
} from '@/components/ui';
import { LinkTestsDialog } from '@/components/features/requirements';
import {
  useGetRequirementQuery,
  useLinkTestCasesMutation,
  useUnlinkTestCasesMutation,
  useDeleteRequirementMutation,
  type RequirementStatus,
} from '@/store/api/requirementsApi';
import { useToast } from '@/hooks';
import { formatDistanceToNow, parseISO } from 'date-fns';

const STATUS_BADGES: Record<RequirementStatus, { variant: 'default' | 'success' | 'warning' | 'destructive'; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  active: { variant: 'success', label: 'Active' },
  deprecated: { variant: 'warning', label: 'Deprecated' },
  completed: { variant: 'default', label: 'Completed' },
};

/**
 * Requirement detail page showing requirement info and linked test cases.
 */
export const RequirementDetailPage: FC = () => {
  const { projectId, requirementId } = useParams<{
    projectId: string;
    requirementId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: requirement,
    isLoading,
    error,
    refetch,
  } = useGetRequirementQuery(
    { projectId: projectId!, id: requirementId! },
    { skip: !projectId || !requirementId }
  );

  const [linkTestCases, { isLoading: isLinking }] = useLinkTestCasesMutation();
  const [unlinkTestCases, { isLoading: isUnlinking }] = useUnlinkTestCasesMutation();
  const [deleteRequirement, { isLoading: isDeleting }] = useDeleteRequirementMutation();

  const handleLinkTestCases = useCallback(
    async (testCaseIds: string[]) => {
      if (!projectId || !requirementId) return;

      try {
        await linkTestCases({
          projectId,
          requirementId,
          testCaseIds,
        }).unwrap();

        toast({
          title: 'Test cases linked',
          description: `Successfully linked ${testCaseIds.length} test case(s)`,
        });
        setShowLinkDialog(false);
      } catch {
        toast({
          title: 'Failed to link test cases',
          description: 'An error occurred while linking test cases',
          variant: 'error',
        });
      }
    },
    [projectId, requirementId, linkTestCases, toast]
  );

  const handleUnlinkTestCase = useCallback(
    async (testCaseId: string) => {
      if (!projectId || !requirementId) return;

      try {
        await unlinkTestCases({
          projectId,
          requirementId,
          testCaseIds: [testCaseId],
        }).unwrap();

        toast({
          title: 'Test case unlinked',
          description: 'Successfully unlinked the test case',
        });
      } catch {
        toast({
          title: 'Failed to unlink test case',
          description: 'An error occurred while unlinking the test case',
          variant: 'error',
        });
      }
    },
    [projectId, requirementId, unlinkTestCases, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!projectId || !requirementId) return;

    try {
      await deleteRequirement({ projectId, id: requirementId }).unwrap();
      toast({
        title: 'Requirement deleted',
        description: 'The requirement has been deleted',
      });
      navigate(`/projects/${projectId}/requirements`);
    } catch {
      toast({
        title: 'Failed to delete requirement',
        description: 'An error occurred while deleting the requirement',
        variant: 'error',
      });
    }
  }, [projectId, requirementId, deleteRequirement, toast, navigate]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if ('status' in error) {
      const fetchError = error as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred loading the requirement';
  }, [error]);

  if (!projectId || !requirementId) {
    return (
      <Alert variant="error">
        <AlertDescription>Invalid requirement parameters</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <RequirementDetailSkeleton />;
  }

  if (errorMessage) {
    return (
      <Alert variant="error">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (!requirement) {
    return (
      <Alert variant="error">
        <AlertDescription>Requirement not found</AlertDescription>
      </Alert>
    );
  }

  const statusBadge = STATUS_BADGES[requirement.status];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/requirements`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Requirement Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {requirement.externalId}
                </Badge>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <CardTitle className="text-2xl">{requirement.title}</CardTitle>
              {requirement.description && (
                <CardDescription className="text-base">
                  {requirement.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requirement.source && (
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{requirement.source}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Coverage</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {requirement.coveragePercentage.toFixed(0)}%
                </span>
                <Progress
                  value={requirement.coveragePercentage}
                  className="h-2 w-16"
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {formatDistanceToNow(parseISO(requirement.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="font-medium">
                {formatDistanceToNow(parseISO(requirement.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Test Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Linked Test Cases</CardTitle>
              <CardDescription>
                {requirement.linkedTestCases.length} test case(s) linked to this requirement
              </CardDescription>
            </div>
            <Button onClick={() => setShowLinkDialog(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Link Test Cases
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requirement.linkedTestCases.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No test cases linked yet. Click "Link Test Cases" to add coverage.
            </div>
          ) : (
            <div className="space-y-2">
              {requirement.linkedTestCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {testCase.status === 'passed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {testCase.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {(!testCase.status || testCase.status === 'untested') && (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{testCase.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testCase.status && (
                      <Badge
                        variant={
                          testCase.status === 'passed'
                            ? 'success'
                            : testCase.status === 'failed'
                              ? 'destructive'
                              : 'default'
                        }
                      >
                        {testCase.status}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlinkTestCase(testCase.id)}
                      disabled={isUnlinking}
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Test Cases Dialog */}
      <LinkTestsDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        projectId={projectId}
        requirementId={requirementId}
        linkedTestCaseIds={requirement.linkedTestCases.map((tc) => tc.id)}
        onLink={handleLinkTestCases}
        isLinking={isLinking}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Requirement"
        description="Are you sure you want to delete this requirement? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
};

const RequirementDetailSkeleton: FC = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    <Skeleton className="h-48" />
    <Skeleton className="h-64" />
  </div>
);
