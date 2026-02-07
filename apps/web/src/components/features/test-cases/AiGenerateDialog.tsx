import { type FC, useState, useCallback } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  Checkbox,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui';
import type { TestCaseTemplate, Priority } from '@/types';

/**
 * Generated test case preview.
 */
interface GeneratedTestCase {
  id: string;
  title: string;
  templateType: TestCaseTemplate;
  priority: Priority;
  preconditions?: string;
  steps?: { content: string; expected: string }[];
  expectedResult?: string;
  selected: boolean;
}

/**
 * Props for the AiGenerateDialog component.
 */
export interface AiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (testCases: Omit<GeneratedTestCase, 'id' | 'selected'>[]) => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

/**
 * Dialog for AI-powered test case generation.
 * Allows users to input requirements and preview/select generated test cases.
 */
export const AiGenerateDialog: FC<AiGenerateDialogProps> = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating: externalIsGenerating,
  className,
}) => {
  const [requirements, setRequirements] = useState('');
  const [generatedCases, setGeneratedCases] = useState<GeneratedTestCase[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const selectedCount = generatedCases.filter((tc) => tc.selected).length;

  const handleGenerate = useCallback(async () => {
    if (!requirements.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedCases([]);

    try {
      // Call AI service endpoint
      const response = await fetch('/api/v1/ai/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          requirements: requirements.trim(),
          templateType: 'steps',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate test cases');
      }

      const data = await response.json();

      // Transform response to our format with selection state
      const generated: GeneratedTestCase[] = (data.data?.testCases ?? []).map(
        (tc: Omit<GeneratedTestCase, 'id' | 'selected'>, index: number) => ({
          ...tc,
          id: `generated-${Date.now()}-${index}`,
          selected: true, // Select all by default
        })
      );

      setGeneratedCases(generated);

      // Expand first item by default
      if (generated.length > 0) {
        setExpandedIds(new Set([generated[0].id]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test cases');
    } finally {
      setIsGenerating(false);
    }
  }, [requirements]);

  const handleToggleSelect = useCallback((id: string) => {
    setGeneratedCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, selected: !tc.selected } : tc))
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = generatedCases.every((tc) => tc.selected);
    setGeneratedCases((prev) => prev.map((tc) => ({ ...tc, selected: !allSelected })));
  }, [generatedCases]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    const selected = generatedCases.filter((tc) => tc.selected);
    if (selected.length === 0) return;

    setIsCreating(true);
    try {
      await onGenerate(
        selected.map(({ id, selected, ...rest }) => rest)
      );
      // Reset and close on success
      setRequirements('');
      setGeneratedCases([]);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test cases');
    } finally {
      setIsCreating(false);
    }
  }, [generatedCases, onGenerate, onOpenChange]);

  const handleClose = useCallback(() => {
    setRequirements('');
    setGeneratedCases([]);
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('max-w-3xl max-h-[80vh] flex flex-col', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Test Case Generator
          </DialogTitle>
          <DialogDescription>
            Describe your requirements and let AI generate test cases for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Requirements input */}
          <div>
            <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium">
              Requirements or Feature Description
            </label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe the feature, user story, or requirements you want to test...&#10;&#10;Example: User login functionality with email and password authentication. Should handle invalid credentials, account lockout after 5 failed attempts, and password reset flow."
              rows={6}
              disabled={isGenerating}
            />
          </div>

          {/* Generate button */}
          {generatedCases.length === 0 && (
            <Button
              onClick={handleGenerate}
              disabled={!requirements.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Test Cases
                </>
              )}
            </Button>
          )}

          {/* Error alert */}
          {error && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generated test cases preview */}
          {generatedCases.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Generated Test Cases ({generatedCases.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {generatedCases.every((tc) => tc.selected) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-auto rounded-md border">
                {generatedCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className={cn(
                      'border-b last:border-0',
                      testCase.selected && 'bg-accent/50'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-3">
                      <Checkbox
                        checked={testCase.selected}
                        onCheckedChange={() => handleToggleSelect(testCase.id)}
                      />
                      <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center"
                        onClick={() => handleToggleExpand(testCase.id)}
                      >
                        {expandedIds.has(testCase.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{testCase.title}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testCase.priority}
                      </Badge>
                    </div>

                    {/* Expanded content */}
                    {expandedIds.has(testCase.id) && (
                      <div className="border-t bg-muted/30 p-3 space-y-2 text-sm">
                        {testCase.preconditions && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Preconditions:
                            </span>
                            <p className="mt-1">{testCase.preconditions}</p>
                          </div>
                        )}
                        {testCase.steps && testCase.steps.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground">Steps:</span>
                            <ol className="mt-1 list-decimal pl-4 space-y-1">
                              {testCase.steps.map((step, i) => (
                                <li key={i}>
                                  {step.content}
                                  {step.expected && (
                                    <span className="text-muted-foreground">
                                      {' '}
                                      → {step.expected}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        {testCase.expectedResult && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Expected Result:
                            </span>
                            <p className="mt-1">{testCase.expectedResult}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          {generatedCases.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedCases([]);
                  setError(null);
                }}
                disabled={isCreating || isGenerating}
              >
                Regenerate
              </Button>
              <Button
                onClick={handleCreate}
                disabled={selectedCount === 0 || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create {selectedCount} Test Case{selectedCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
