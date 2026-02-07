import { useState, useCallback, useMemo } from 'react';
import {
  useGetTestSuitesQuery,
  useGetSectionsQuery,
  useCreateTestSuiteMutation,
  useUpdateTestSuiteMutation,
  useDeleteTestSuiteMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useMoveSectionMutation,
  type TestSuite,
  type Section,
  type CreateTestSuiteRequest,
  type UpdateTestSuiteRequest,
  type CreateSectionRequest,
  type UpdateSectionRequest,
} from '@/store/api/testSuitesApi';

/**
 * Options for the useSections hook.
 */
export interface UseSectionsOptions {
  projectId: string;
}

/**
 * Return type of the useSections hook.
 */
export interface UseSectionsResult {
  // Data
  suites: TestSuite[];
  sections: Section[];
  selectedSuiteId: string | undefined;
  selectedSectionId: string | undefined;
  expandedIds: Set<string>;

  // Loading states
  isLoadingSuites: boolean;
  isLoadingSections: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions - Suite selection
  selectSuite: (suiteId: string) => void;

  // Actions - Section selection
  selectSection: (sectionId: string | undefined) => void;

  // Actions - Expand/Collapse
  toggleExpanded: (sectionId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Actions - Suite CRUD
  createSuite: (data: Omit<CreateTestSuiteRequest, 'projectId'>) => Promise<TestSuite>;
  updateSuite: (suiteId: string, data: UpdateTestSuiteRequest) => Promise<TestSuite>;
  deleteSuite: (suiteId: string) => Promise<void>;

  // Actions - Section CRUD
  createSection: (
    data: Omit<CreateSectionRequest, 'projectId' | 'suiteId'>
  ) => Promise<Section>;
  updateSection: (sectionId: string, data: UpdateSectionRequest) => Promise<Section>;
  deleteSection: (sectionId: string) => Promise<void>;
  moveSection: (sectionId: string, parentId: string | undefined, position: number) => Promise<void>;

  // Actions - Refresh
  refetchSuites: () => void;
  refetchSections: () => void;
}

/**
 * Helper function to collect all section IDs recursively.
 */
function collectAllSectionIds(sections: Section[]): string[] {
  const ids: string[] = [];
  const traverse = (items: Section[]) => {
    for (const item of items) {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };
  traverse(sections);
  return ids;
}

/**
 * Custom hook for managing test suites and sections with a tree structure.
 * Handles selection, expand/collapse state, and CRUD operations.
 */
export function useSections({
  projectId,
}: UseSectionsOptions): UseSectionsResult {
  // Local state
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // RTK Query hooks - Suites
  const {
    data: suites = [],
    isLoading: isLoadingSuites,
    error: suitesError,
    refetch: refetchSuites,
  } = useGetTestSuitesQuery(projectId, {
    skip: !projectId,
  });

  // RTK Query hooks - Sections (only fetch when a suite is selected)
  const {
    data: sections = [],
    isLoading: isLoadingSections,
    error: sectionsError,
    refetch: refetchSections,
  } = useGetSectionsQuery(
    { projectId, suiteId: selectedSuiteId! },
    { skip: !projectId || !selectedSuiteId }
  );

  // Mutations - Suites
  const [createSuiteMutation, { isLoading: isCreatingSuite }] = useCreateTestSuiteMutation();
  const [updateSuiteMutation, { isLoading: isUpdatingSuite }] = useUpdateTestSuiteMutation();
  const [deleteSuiteMutation, { isLoading: isDeletingSuite }] = useDeleteTestSuiteMutation();

  // Mutations - Sections
  const [createSectionMutation, { isLoading: isCreatingSection }] = useCreateSectionMutation();
  const [updateSectionMutation, { isLoading: isUpdatingSection }] = useUpdateSectionMutation();
  const [deleteSectionMutation, { isLoading: isDeletingSection }] = useDeleteSectionMutation();
  const [moveSectionMutation, { isLoading: isMovingSection }] = useMoveSectionMutation();

  // Derived states
  const isCreating = isCreatingSuite || isCreatingSection;
  const isUpdating = isUpdatingSuite || isUpdatingSection || isMovingSection;
  const isDeleting = isDeletingSuite || isDeletingSection;

  // Error handling
  const error = useMemo(() => {
    const err = suitesError || sectionsError;
    if (!err) return null;
    if ('status' in err) {
      const fetchError = err as { status: number; data?: { message?: string } };
      return fetchError.data?.message ?? `Error ${fetchError.status}`;
    }
    return 'An error occurred';
  }, [suitesError, sectionsError]);

  // Auto-select first suite when suites load and none is selected
  useMemo(() => {
    if (suites.length > 0 && !selectedSuiteId) {
      setSelectedSuiteId(suites[0].id);
    }
  }, [suites, selectedSuiteId]);

  // Suite selection
  const selectSuite = useCallback((suiteId: string) => {
    setSelectedSuiteId(suiteId);
    setSelectedSectionId(undefined); // Clear section selection when suite changes
    setExpandedIds(new Set()); // Collapse all when suite changes
  }, []);

  // Section selection
  const selectSection = useCallback((sectionId: string | undefined) => {
    setSelectedSectionId(sectionId);
  }, []);

  // Expand/Collapse actions
  const toggleExpanded = useCallback((sectionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = collectAllSectionIds(sections);
    setExpandedIds(new Set(allIds));
  }, [sections]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Suite CRUD actions
  const createSuite = useCallback(
    async (data: Omit<CreateTestSuiteRequest, 'projectId'>): Promise<TestSuite> => {
      const result = await createSuiteMutation({
        ...data,
        projectId,
      }).unwrap();

      // Auto-select the newly created suite
      setSelectedSuiteId(result.id);

      return result;
    },
    [createSuiteMutation, projectId]
  );

  const updateSuite = useCallback(
    async (suiteId: string, data: UpdateTestSuiteRequest): Promise<TestSuite> => {
      const result = await updateSuiteMutation({
        projectId,
        suiteId,
        ...data,
      }).unwrap();
      return result;
    },
    [updateSuiteMutation, projectId]
  );

  const deleteSuite = useCallback(
    async (suiteId: string): Promise<void> => {
      await deleteSuiteMutation({ projectId, suiteId }).unwrap();

      // If deleted suite was selected, select the first available suite
      if (selectedSuiteId === suiteId) {
        const remainingSuites = suites.filter((s) => s.id !== suiteId);
        setSelectedSuiteId(remainingSuites.length > 0 ? remainingSuites[0].id : undefined);
        setSelectedSectionId(undefined);
      }
    },
    [deleteSuiteMutation, projectId, selectedSuiteId, suites]
  );

  // Section CRUD actions
  const createSection = useCallback(
    async (data: Omit<CreateSectionRequest, 'projectId' | 'suiteId'>): Promise<Section> => {
      if (!selectedSuiteId) {
        throw new Error('No suite selected');
      }

      const result = await createSectionMutation({
        ...data,
        projectId,
        suiteId: selectedSuiteId,
      }).unwrap();

      // Auto-select the newly created section
      setSelectedSectionId(result.id);

      // If it has a parent, expand the parent
      if (result.parentId) {
        setExpandedIds((prev) => new Set([...prev, result.parentId!]));
      }

      return result;
    },
    [createSectionMutation, projectId, selectedSuiteId]
  );

  const updateSection = useCallback(
    async (sectionId: string, data: UpdateSectionRequest): Promise<Section> => {
      if (!selectedSuiteId) {
        throw new Error('No suite selected');
      }

      const result = await updateSectionMutation({
        projectId,
        suiteId: selectedSuiteId,
        sectionId,
        ...data,
      }).unwrap();
      return result;
    },
    [updateSectionMutation, projectId, selectedSuiteId]
  );

  const deleteSection = useCallback(
    async (sectionId: string): Promise<void> => {
      if (!selectedSuiteId) {
        throw new Error('No suite selected');
      }

      await deleteSectionMutation({
        projectId,
        suiteId: selectedSuiteId,
        sectionId,
      }).unwrap();

      // Clear selection if deleted section was selected
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(undefined);
      }

      // Remove from expanded set
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    },
    [deleteSectionMutation, projectId, selectedSuiteId, selectedSectionId]
  );

  const moveSection = useCallback(
    async (sectionId: string, parentId: string | undefined, position: number): Promise<void> => {
      if (!selectedSuiteId) {
        throw new Error('No suite selected');
      }

      await moveSectionMutation({
        projectId,
        suiteId: selectedSuiteId,
        sectionId,
        parentId,
        position,
      }).unwrap();

      // Expand the new parent if one exists
      if (parentId) {
        setExpandedIds((prev) => new Set([...prev, parentId]));
      }
    },
    [moveSectionMutation, projectId, selectedSuiteId]
  );

  return {
    // Data
    suites,
    sections,
    selectedSuiteId,
    selectedSectionId,
    expandedIds,

    // Loading states
    isLoadingSuites,
    isLoadingSections,
    isCreating,
    isUpdating,
    isDeleting,

    // Error state
    error,

    // Actions - Suite selection
    selectSuite,

    // Actions - Section selection
    selectSection,

    // Actions - Expand/Collapse
    toggleExpanded,
    expandAll,
    collapseAll,

    // Actions - Suite CRUD
    createSuite,
    updateSuite,
    deleteSuite,

    // Actions - Section CRUD
    createSection,
    updateSection,
    deleteSection,
    moveSection,

    // Actions - Refresh
    refetchSuites,
    refetchSections,
  };
}
