import { type FC, useState, useMemo, useCallback } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Checkbox,
  Badge,
  Skeleton,
} from '@/components/ui';
import { useGetTestCasesQuery } from '@/store/api/testCasesApi';
import { cn } from '@/utils/cn';

export interface LinkTestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  requirementId?: string;
  linkedTestCaseIds: string[];
  onLink: (testCaseIds: string[]) => Promise<void>;
  isLinking?: boolean;
}

/**
 * Dialog for searching and selecting test cases to link to a requirement.
 */
export const LinkTestsDialog: FC<LinkTestsDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  linkedTestCaseIds,
  onLink,
  isLinking,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetTestCasesQuery(
    { projectId, search: search || undefined, pageSize: 50 },
    { skip: !open }
  );

  // Filter out already linked test cases
  const availableTestCases = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((tc) => !linkedTestCaseIds.includes(tc.id));
  }, [data?.items, linkedTestCaseIds]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === availableTestCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableTestCases.map((tc) => tc.id)));
    }
  }, [availableTestCases, selectedIds.size]);

  const handleLink = useCallback(async () => {
    if (selectedIds.size === 0) return;
    await onLink(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearch('');
  }, [selectedIds, onLink]);

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setSearch('');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Test Cases</DialogTitle>
          <DialogDescription>
            Search and select test cases to link to this requirement
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Test Cases List */}
        <div className="max-h-80 space-y-1 overflow-auto rounded-lg border p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : availableTestCases.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {search
                ? 'No matching test cases found'
                : 'All test cases are already linked'}
            </div>
          ) : (
            <>
              {/* Select All */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={selectedIds.size === availableTestCases.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">
                  Select all ({availableTestCases.length})
                </span>
              </button>

              <div className="my-1 border-t" />

              {/* Test Case Items */}
              {availableTestCases.map((testCase) => {
                const isSelected = selectedIds.has(testCase.id);

                return (
                  <button
                    key={testCase.id}
                    type="button"
                    onClick={() => handleToggle(testCase.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors',
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(testCase.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">
                          {testCase.title}
                        </span>
                        <Badge
                          variant={
                            testCase.priority === 'critical'
                              ? 'destructive'
                              : testCase.priority === 'high'
                                ? 'warning'
                                : 'default'
                          }
                          className="shrink-0"
                        >
                          {testCase.priority}
                        </Badge>
                      </div>
                      {testCase.preconditions && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {testCase.preconditions}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Selected Count */}
        {selectedIds.size > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} test case{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLinking}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={selectedIds.size === 0 || isLinking}
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              `Link ${selectedIds.size} Test Case${selectedIds.size !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
