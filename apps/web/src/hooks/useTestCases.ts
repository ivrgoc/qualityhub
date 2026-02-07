import { useState, useCallback, useMemo } from 'react';
import {
  useGetTestCasesQuery,
  useGetTestCaseQuery,
  useCreateTestCaseMutation,
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation,
  useBulkDeleteTestCasesMutation,
  useBulkUpdateTestCasesMutation,
  type GetTestCasesParams,
  type CreateTestCaseRequest,
  type UpdateTestCaseRequest,
} from '@/store/api/testCasesApi';
import type { TestCase, Priority, TestCaseTemplate } from '@/types';

/**
 * Filter state for test cases list.
 */
export interface TestCaseFilters {
  search: string;
  priority?: Priority;
  templateType?: TestCaseTemplate;
  sectionId?: string;
}

/**
 * Options for the useTestCases hook.
 */
export interface UseTestCasesOptions {
  projectId: string;
  initialFilters?: Partial<TestCaseFilters>;
  pageSize?: number;
}

/**
 * Return type of the useTestCases hook.
 */
export interface UseTestCasesResult {
  // Data
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  totalCount: number;
  totalPages: number;
  page: number;

  // Selection state
  selectedIds: Set<string>;
  isAllSelected: boolean;
  hasSelection: boolean;
  selectionCount: number;

  // Filter state
  filters: TestCaseFilters;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions - Pagination
  setPage: (page: number) => void;

  // Actions - Filtering
  setFilters: (filters: Partial<TestCaseFilters>) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setSectionId: (sectionId: string | undefined) => void;

  // Actions - Selection
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectedTestCase: (testCase: TestCase | null) => void;

  // Actions - CRUD
  createTestCase: (data: Omit<CreateTestCaseRequest, 'projectId'>) => Promise<TestCase>;
  updateTestCase: (id: string, data: UpdateTestCaseRequest) => Promise<TestCase>;
  deleteTestCase: (id: string) => Promise<void>;

  // Actions - Bulk
  bulkDelete: () => Promise<void>;
  bulkMove: (sectionId: string) => Promise<void>;

  // Actions - Refresh
  refetch: () => void;
}

const DEFAULT_PAGE_SIZE = 25;

const DEFAULT_FILTERS: TestCaseFilters = {
  search: '',
  priority: undefined,
  templateType: undefined,
  sectionId: undefined,
};

/**
 * Custom hook for managing test cases with CRUD operations, filtering, pagination, and selection.
 * Wraps RTK Query endpoints with additional state management.
 */
export function useTestCases({
  projectId,
  initialFilters = {},
  pageSize = DEFAULT_PAGE_SIZE,
}: UseTestCasesOptions): UseTestCasesResult {
  // Local state
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<TestCaseFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  // Build query params
  const queryParams: GetTestCasesParams = useMemo(
    () => ({
      projectId,
      page,
      pageSize,
      search: filters.search || undefined,
      priority: filters.priority,
      templateType: filters.templateType,
      sectionId: filters.sectionId,
    }),
    [projectId, page, pageSize, filters]
  );

  // RTK Query hooks
  const {
    data: testCasesData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetTestCasesQuery(queryParams, {
    skip: !projectId,
  });

  const [createTestCaseMutation, { isLoading: isCreating }] = useCreateTestCaseMutation();
  const [updateTestCaseMutation, { isLoading: isUpdating }] = useUpdateTestCaseMutation();
  const [deleteTestCaseMutation, { isLoading: isDeletingSingle }] = useDeleteTestCaseMutation();
  const [bulkDeleteMutation, { isLoading: isBulkDeleting }] = useBulkDeleteTestCasesMutation();
  const [bulkUpdateMutation, { isLoading: isBulkUpdating }] = useBulkUpdateTestCasesMutation();

  // Derived values
  const testCases = testCasesData?.items ?? [];
  const totalCount = testCasesData?.total ?? 0;
  const totalPages = testCasesData?.totalPages ?? 0;
  const isDeleting = isDeletingSingle || isBulkDeleting || isBulkUpdating;
  const hasSelection = selectedIds.size > 0;
  const selectionCount = selectedIds.size;
  const isAllSelected = testCases.length > 0 && selectedIds.size === testCases.length;

  // Error handling
  const error = useMemo(() => {
    if (!queryError) return null;
    if ('status' in queryError) {
      const fetchError = queryError as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [queryError]);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<TestCaseFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
    setSelectedIds(new Set()); // Clear selection when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const setSearch = useCallback(
    (search: string) => {
      setFilters({ search });
    },
    [setFilters]
  );

  const setSectionId = useCallback(
    (sectionId: string | undefined) => {
      setFilters({ sectionId });
    },
    [setFilters]
  );

  // Selection actions
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(testCases.map((tc) => tc.id)));
    }
  }, [isAllSelected, testCases]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // CRUD actions
  const createTestCase = useCallback(
    async (data: Omit<CreateTestCaseRequest, 'projectId'>): Promise<TestCase> => {
      const result = await createTestCaseMutation({
        ...data,
        projectId,
      }).unwrap();
      return result;
    },
    [createTestCaseMutation, projectId]
  );

  const updateTestCase = useCallback(
    async (id: string, data: UpdateTestCaseRequest): Promise<TestCase> => {
      const result = await updateTestCaseMutation({
        projectId,
        id,
        ...data,
      }).unwrap();

      // Update selected test case if it was the one being edited
      if (selectedTestCase?.id === id) {
        setSelectedTestCase(result);
      }

      return result;
    },
    [updateTestCaseMutation, projectId, selectedTestCase]
  );

  const deleteTestCase = useCallback(
    async (id: string): Promise<void> => {
      await deleteTestCaseMutation({ projectId, id }).unwrap();

      // Clear selection if deleted test case was selected
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      // Clear selected test case if it was deleted
      if (selectedTestCase?.id === id) {
        setSelectedTestCase(null);
      }
    },
    [deleteTestCaseMutation, projectId, selectedTestCase]
  );

  // Bulk actions
  const bulkDelete = useCallback(async (): Promise<void> => {
    if (selectedIds.size === 0) return;

    await bulkDeleteMutation({
      projectId,
      ids: Array.from(selectedIds),
    }).unwrap();

    // Clear selection after bulk delete
    setSelectedIds(new Set());

    // Clear selected test case if it was in the deleted set
    if (selectedTestCase && selectedIds.has(selectedTestCase.id)) {
      setSelectedTestCase(null);
    }
  }, [bulkDeleteMutation, projectId, selectedIds, selectedTestCase]);

  const bulkMove = useCallback(
    async (sectionId: string): Promise<void> => {
      if (selectedIds.size === 0) return;

      await bulkUpdateMutation({
        projectId,
        updates: Array.from(selectedIds).map((id) => ({
          id,
          sectionId,
        })),
      }).unwrap();

      // Clear selection after bulk move
      setSelectedIds(new Set());
    },
    [bulkUpdateMutation, projectId, selectedIds]
  );

  return {
    // Data
    testCases,
    selectedTestCase,
    totalCount,
    totalPages,
    page,

    // Selection state
    selectedIds,
    isAllSelected,
    hasSelection,
    selectionCount,

    // Filter state
    filters,

    // Loading states
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,

    // Error state
    error,

    // Actions - Pagination
    setPage,

    // Actions - Filtering
    setFilters,
    clearFilters,
    setSearch,
    setSectionId,

    // Actions - Selection
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectedTestCase,

    // Actions - CRUD
    createTestCase,
    updateTestCase,
    deleteTestCase,

    // Actions - Bulk
    bulkDelete,
    bulkMove,

    // Actions - Refresh
    refetch,
  };
}

/**
 * Hook for fetching a single test case by ID.
 */
export function useTestCase(projectId: string, testCaseId: string | undefined) {
  const { data, isLoading, isFetching, error } = useGetTestCaseQuery(
    { projectId, id: testCaseId! },
    { skip: !projectId || !testCaseId }
  );

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if ('status' in error) {
      const fetchError = error as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [error]);

  return {
    testCase: data ?? null,
    isLoading,
    isFetching,
    error: errorMessage,
  };
}
