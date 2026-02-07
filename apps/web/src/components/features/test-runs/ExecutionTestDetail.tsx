import { type FC } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Badge, Card, CardContent, Skeleton } from '@/components/ui';
import type { TestCase, Priority } from '@/types';

/**
 * Get badge variant for priority.
 */
function getPriorityVariant(priority: Priority): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
    default:
      return 'outline';
  }
}

/**
 * Props for the ExecutionTestDetail component.
 */
export interface ExecutionTestDetailProps {
  testCase: TestCase | null;
  testNumber: number;
  totalTests: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}

/**
 * Component showing test case details during execution.
 * Includes navigation controls and displays all test case content.
 */
export const ExecutionTestDetail: FC<ExecutionTestDetailProps> = ({
  testCase,
  testNumber,
  totalTests,
  hasNext,
  hasPrevious,
  isLoading,
  onNext,
  onPrevious,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('p-4 space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No test case selected</p>
          <p className="text-sm mt-1">Select a test from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Navigation header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Test {testNumber} of {totalTests}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5">←</kbd> / <kbd className="rounded bg-muted px-1.5 py-0.5">→</kbd> to navigate
        </div>
      </div>

      {/* Test case content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Title and metadata */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>TC-{testCase.id.slice(0, 8)}</span>
            <span>|</span>
            <span>v{testCase.version}</span>
          </div>
          <h2 className="text-lg font-semibold">{testCase.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={getPriorityVariant(testCase.priority)}>
              {testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1)}
            </Badge>
            <Badge variant="outline">{testCase.templateType}</Badge>
          </div>
        </div>

        {/* Preconditions */}
        {testCase.preconditions && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Preconditions</h3>
              <p className="text-sm whitespace-pre-wrap">{testCase.preconditions}</p>
            </CardContent>
          </Card>
        )}

        {/* Steps (for steps template) */}
        {testCase.templateType === 'steps' && testCase.steps && testCase.steps.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Test Steps</h3>
              <div className="space-y-4">
                {testCase.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Action</span>
                        <p className="text-sm whitespace-pre-wrap">{step.content}</p>
                      </div>
                      {step.expected && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Expected Result
                          </span>
                          <p className="text-sm whitespace-pre-wrap">{step.expected}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* BDD/Gherkin content */}
        {testCase.templateType === 'bdd' && testCase.expectedResult && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Gherkin Scenario</h3>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md overflow-auto">
                {testCase.expectedResult}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Text/Exploratory content */}
        {(testCase.templateType === 'text' || testCase.templateType === 'exploratory') &&
          testCase.expectedResult && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {testCase.templateType === 'exploratory' ? 'Test Charter' : 'Expected Result'}
                </h3>
                <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
              </CardContent>
            </Card>
          )}

        {/* Overall Expected Result for steps template */}
        {testCase.templateType === 'steps' && testCase.expectedResult && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Overall Expected Result
              </h3>
              <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
