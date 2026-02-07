import { type FC, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  RequirementList,
  TraceabilityMatrix,
} from '@/components/features/requirements';
import {
  useGetRequirementsQuery,
  useGetTraceabilityMatrixQuery,
  type RequirementStatus,
} from '@/store/api/requirementsApi';

/**
 * Requirements page with table view, filters, and traceability matrix.
 */
export const RequirementsPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [coverageFilter, setCoverageFilter] = useState<'all' | 'covered' | 'uncovered'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');

  // Fetch requirements
  const {
    data: requirementsData,
    isLoading: isLoadingRequirements,
    isFetching,
    error: requirementsError,
    refetch,
  } = useGetRequirementsQuery(
    {
      projectId: projectId!,
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      hasCoverage: coverageFilter === 'covered' ? true : coverageFilter === 'uncovered' ? false : undefined,
    },
    { skip: !projectId }
  );

  // Fetch traceability matrix
  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    error: matrixError,
  } = useGetTraceabilityMatrixQuery(
    { projectId: projectId! },
    { skip: !projectId || activeTab !== 'matrix' }
  );

  const handleRequirementSelect = useCallback(
    (requirement: { id: string }) => {
      navigate(`/projects/${projectId}/requirements/${requirement.id}`);
    },
    [projectId, navigate]
  );

  const errorMessage = useMemo(() => {
    const err = requirementsError || matrixError;
    if (!err) return null;
    if ('status' in err) {
      const fetchError = err as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [requirementsError, matrixError]);

  if (!projectId) {
    return (
      <Alert variant="error">
        <AlertDescription>Project ID is required</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Requirements
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage requirements and track test coverage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={isFetching ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'}
            />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="error">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'matrix')}>
        <TabsList>
          <TabsTrigger value="list">Requirements List</TabsTrigger>
          <TabsTrigger value="matrix">
            <Grid3X3 className="mr-2 h-4 w-4" />
            Traceability Matrix
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as RequirementStatus | 'all')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={coverageFilter}
                onValueChange={(v) => setCoverageFilter(v as 'all' | 'covered' | 'uncovered')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coverage</SelectItem>
                  <SelectItem value="covered">Covered</SelectItem>
                  <SelectItem value="uncovered">Uncovered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requirements List */}
          <RequirementList
            requirements={requirementsData?.items ?? []}
            isLoading={isLoadingRequirements}
            onSelect={handleRequirementSelect}
          />

          {/* Pagination info */}
          {requirementsData && (
            <div className="text-sm text-muted-foreground">
              Showing {requirementsData.items.length} of {requirementsData.total} requirements
            </div>
          )}
        </TabsContent>

        {/* Matrix View */}
        <TabsContent value="matrix">
          {matrixData && (
            <TraceabilityMatrix
              data={matrixData}
              isLoading={isLoadingMatrix}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
