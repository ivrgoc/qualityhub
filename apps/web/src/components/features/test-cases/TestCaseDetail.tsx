import { type FC } from 'react';
import {
  Pencil,
  Trash2,
  Clock,
  Calendar,
  User,
  History,
  FileText,
  ListChecks,
  Code,
  Search,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { TestCase, TestCaseTemplate, Priority } from '@/types';

/**
 * Get icon for test case template type.
 */
function getTemplateIcon(template: TestCaseTemplate) {
  switch (template) {
    case 'steps':
      return <ListChecks className="h-4 w-4" />;
    case 'bdd':
      return <Code className="h-4 w-4" />;
    case 'exploratory':
      return <Search className="h-4 w-4" />;
    case 'text':
    default:
      return <FileText className="h-4 w-4" />;
  }
}

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
 * Get label for template type.
 */
function getTemplateLabel(template: TestCaseTemplate): string {
  const labels: Record<TestCaseTemplate, string> = {
    steps: 'Steps',
    text: 'Text',
    bdd: 'BDD/Gherkin',
    exploratory: 'Exploratory',
  };
  return labels[template];
}

/**
 * Props for the TestCaseDetail component.
 */
export interface TestCaseDetailProps {
  testCase: TestCase | null;
  isLoading?: boolean;
  onEdit?: (testCase: TestCase) => void;
  onDelete?: (testCase: TestCase) => void;
  onViewHistory?: (testCase: TestCase) => void;
  className?: string;
}

/**
 * Component for displaying test case details.
 * Shows all fields including preconditions, steps, expected result, and metadata.
 */
export const TestCaseDetail: FC<TestCaseDetailProps> = ({
  testCase,
  isLoading,
  onEdit,
  onDelete,
  onViewHistory,
  className,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('p-6 space-y-6', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-96" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Empty state
  if (!testCase) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No test case selected</p>
          <p className="text-sm mt-1">Select a test case from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {getTemplateIcon(testCase.templateType)}
              <span>{getTemplateLabel(testCase.templateType)}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>TC-{testCase.id.slice(0, 8)}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>v{testCase.version}</span>
            </div>
            <h2 className="text-xl font-semibold truncate">{testCase.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onViewHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewHistory(testCase)}
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(testCase)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(testCase)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <Badge variant={getPriorityVariant(testCase.priority)}>
            {testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1)} Priority
          </Badge>
          {testCase.estimate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{testCase.estimate} min</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatRelativeTime(testCase.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Preconditions */}
        {testCase.preconditions && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preconditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{testCase.preconditions}</p>
            </CardContent>
          </Card>
        )}

        {/* Steps (for steps template) */}
        {testCase.templateType === 'steps' && testCase.steps && testCase.steps.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Test Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCase.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
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
            </CardContent>
          </Card>
        )}

        {/* BDD/Gherkin content */}
        {testCase.templateType === 'bdd' && testCase.expectedResult && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gherkin Scenario</CardTitle>
            </CardHeader>
            <CardContent>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {testCase.templateType === 'exploratory' ? 'Test Charter' : 'Expected Result'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
              </CardContent>
            </Card>
          )}

        {/* Expected Result (for steps template without inline expected) */}
        {testCase.templateType === 'steps' && testCase.expectedResult && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Expected Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
