import { type FC, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, FolderPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Alert, AlertDescription, ConfirmDialog } from '@/components/ui';
import {
  SectionTree,
  TestCaseList,
  TestCaseDetail,
  TestCaseForm,
  BulkActionsBar,
  AiGenerateDialog,
  type TestCaseFormValues,
} from '@/components/features/test-cases';
import { useTestCases, useSections } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import type { Section } from '@/store/api/testSuitesApi';
import type { TestCase } from '@/types';

/**
 * View mode for the right panel.
 */
type ViewMode = 'detail' | 'create' | 'edit';

/**
 * Test Cases page with three-column layout.
 * Left: Section tree navigation
 * Center: Test case list with search/filter
 * Right: Test case detail or form
 */
export const TestCasesPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();

  // State for dialogs and views
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [parentSectionId, setParentSectionId] = useState<string | undefined>(undefined);

  // Sections hook
  const {
    suites,
    sections,
    selectedSuiteId,
    selectedSectionId,
    expandedIds,
    isLoadingSections,
    isCreating: isCreatingSection,
    isDeleting: isDeletingSection,
    error: sectionsError,
    selectSuite,
    selectSection,
    toggleExpanded,
    expandAll,
    collapseAll,
    createSection,
    updateSection,
    deleteSection,
  } = useSections({ projectId: projectId! });

  // Test cases hook
  const {
    testCases,
    selectedTestCase,
    selectedIds,
    filters,
    page,
    totalPages,
    totalCount,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isAllSelected,
    hasSelection,
    selectionCount,
    error: testCasesError,
    setPage,
    setFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectedTestCase,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    bulkDelete,
    bulkMove,
  } = useTestCases({
    projectId: projectId!,
    initialFilters: { sectionId: selectedSectionId },
  });

  // Update section filter when section selection changes
  useMemo(() => {
    setFilters({ sectionId: selectedSectionId });
  }, [selectedSectionId, setFilters]);

  // Handler for selecting a test case from the list
  const handleSelectTestCase = useCallback(
    (testCase: TestCase) => {
      setSelectedTestCase(testCase);
      setViewMode('detail');
      setEditingTestCase(null);
    },
    [setSelectedTestCase]
  );

  // Handler for creating a new test case
  const handleCreateTestCase = useCallback(() => {
    setViewMode('create');
    setEditingTestCase(null);
    setSelectedTestCase(null);
  }, [setSelectedTestCase]);

  // Handler for editing a test case
  const handleEditTestCase = useCallback((testCase: TestCase) => {
    setViewMode('edit');
    setEditingTestCase(testCase);
  }, []);

  // Handler for canceling form
  const handleCancelForm = useCallback(() => {
    setViewMode('detail');
    setEditingTestCase(null);
  }, []);

  // Handler for form submit
  const handleFormSubmit = useCallback(
    async (values: TestCaseFormValues) => {
      try {
        if (editingTestCase) {
          // Update existing
          const updated = await updateTestCase(editingTestCase.id, {
            title: values.title,
            templateType: values.templateType,
            priority: values.priority,
            preconditions: values.preconditions,
            steps: values.steps,
            expectedResult: values.expectedResult,
            estimate: values.estimate ?? undefined,
            sectionId: values.sectionId,
          });
          toast({ title: 'Test case updated', variant: 'success' });
          setSelectedTestCase(updated);
        } else {
          // Create new
          const created = await createTestCase({
            sectionId: values.sectionId,
            title: values.title,
            templateType: values.templateType,
            priority: values.priority,
            preconditions: values.preconditions,
            steps: values.steps,
            expectedResult: values.expectedResult,
            estimate: values.estimate ?? undefined,
          });
          toast({ title: 'Test case created', variant: 'success' });
          setSelectedTestCase(created);
        }
        setViewMode('detail');
        setEditingTestCase(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save test case',
          variant: 'error',
        });
      }
    },
    [editingTestCase, updateTestCase, createTestCase, toast, setSelectedTestCase]
  );

  // Handler for deleting a test case
  const handleDeleteTestCase = useCallback((testCase: TestCase) => {
    setEditingTestCase(testCase);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!editingTestCase) return;
    try {
      await deleteTestCase(editingTestCase.id);
      toast({ title: 'Test case deleted', variant: 'success' });
      setShowDeleteConfirm(false);
      setEditingTestCase(null);
      setViewMode('detail');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete test case',
        variant: 'error',
      });
    }
  }, [editingTestCase, deleteTestCase, toast]);

  // Handler for bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      await bulkDelete();
      toast({ title: `${selectionCount} test cases deleted`, variant: 'success' });
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete test cases',
        variant: 'error',
      });
    }
  }, [bulkDelete, selectionCount, toast]);

  // Handler for bulk move (simplified - would need a section picker dialog)
  const handleBulkMove = useCallback(() => {
    setShowMoveDialog(true);
  }, []);

  // Handler for AI generation
  const handleAiGenerate = useCallback(
    async (testCases: { title: string; templateType: any; priority: any; preconditions?: string; steps?: any[]; expectedResult?: string }[]) => {
      if (!selectedSectionId) {
        toast({
          title: 'Select a section',
          description: 'Please select a section to add the generated test cases to',
          variant: 'error',
        });
        return;
      }

      try {
        for (const tc of testCases) {
          await createTestCase({
            sectionId: selectedSectionId,
            title: tc.title,
            templateType: tc.templateType,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: tc.steps?.map((s, i) => ({ id: `step-${i}`, content: s.content, expected: s.expected })),
            expectedResult: tc.expectedResult,
          });
        }
        toast({ title: `${testCases.length} test cases created`, variant: 'success' });
      } catch (error) {
        throw error;
      }
    },
    [selectedSectionId, createTestCase, toast]
  );

  // Section handlers
  const handleAddSection = useCallback((parentId?: string) => {
    setParentSectionId(parentId);
    setSectionToEdit(null);
    setShowSectionDialog(true);
  }, []);

  const handleEditSection = useCallback((section: Section) => {
    setSectionToEdit(section);
    setShowSectionDialog(true);
  }, []);

  const handleDeleteSection = useCallback(
    async (sectionId: string) => {
      if (confirm('Are you sure you want to delete this section? All test cases in this section will also be deleted.')) {
        try {
          await deleteSection(sectionId);
          toast({ title: 'Section deleted', variant: 'success' });
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to delete section',
            variant: 'error',
          });
        }
      }
    },
    [deleteSection, toast]
  );

  const error = sectionsError || testCasesError;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold">Test Cases</h1>
          <p className="text-sm text-muted-foreground">
            Manage your test cases and organize them into sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAiDialog(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generate
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="error" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Section tree */}
        <div className="w-64 shrink-0 border-r bg-muted/30 overflow-hidden flex flex-col">
          <SectionTree
            sections={sections}
            selectedSectionId={selectedSectionId}
            expandedIds={expandedIds}
            isLoading={isLoadingSections}
            onSelect={selectSection}
            onToggleExpand={toggleExpanded}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onAddSection={handleAddSection}
            onEditSection={handleEditSection}
            onDeleteSection={handleDeleteSection}
            className="h-full"
          />
        </div>

        {/* Center panel - Test case list */}
        <div className="flex-1 min-w-0 border-r overflow-hidden flex flex-col">
          <TestCaseList
            testCases={testCases}
            selectedTestCase={selectedTestCase}
            selectedIds={selectedIds}
            filters={filters}
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            isLoading={isLoading}
            isAllSelected={isAllSelected}
            onSelectTestCase={handleSelectTestCase}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onSetFilters={setFilters}
            onSetPage={setPage}
            onCreateTestCase={handleCreateTestCase}
            className="h-full"
          />
        </div>

        {/* Right panel - Detail or Form */}
        <div className="w-[480px] shrink-0 overflow-hidden flex flex-col bg-background">
          {viewMode === 'detail' && (
            <TestCaseDetail
              testCase={selectedTestCase}
              isLoading={isFetching}
              onEdit={handleEditTestCase}
              onDelete={handleDeleteTestCase}
              className="h-full"
            />
          )}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <TestCaseForm
              testCase={editingTestCase}
              sectionId={selectedSectionId}
              isSubmitting={isCreating || isUpdating}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectionCount}
        isDeleting={isDeleting}
        onMove={handleBulkMove}
        onDelete={() => setShowBulkDeleteConfirm(true)}
        onClearSelection={clearSelection}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Test Case"
        description={`Are you sure you want to delete "${editingTestCase?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Bulk delete confirmation dialog */}
      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title="Delete Test Cases"
        description={`Are you sure you want to delete ${selectionCount} test cases? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />

      {/* AI Generate dialog */}
      <AiGenerateDialog
        open={showAiDialog}
        onOpenChange={setShowAiDialog}
        onGenerate={handleAiGenerate}
      />
    </div>
  );
};
