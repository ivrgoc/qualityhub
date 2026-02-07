import { type FC, type MouseEvent, useCallback } from 'react';
import { FileText, ListChecks, Code, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Checkbox, Badge } from '@/components/ui';
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
 * Get label for priority.
 */
function getPriorityLabel(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Props for the TestCaseRow component.
 */
export interface TestCaseRowProps {
  testCase: TestCase;
  isSelected?: boolean;
  isChecked?: boolean;
  onSelect?: (testCase: TestCase) => void;
  onToggleCheck?: (id: string) => void;
  className?: string;
}

/**
 * Row component for displaying a test case in a list.
 * Shows checkbox, title, priority badge, and template icon.
 */
export const TestCaseRow: FC<TestCaseRowProps> = ({
  testCase,
  isSelected = false,
  isChecked = false,
  onSelect,
  onToggleCheck,
  className,
}) => {
  const handleClick = useCallback(() => {
    onSelect?.(testCase);
  }, [onSelect, testCase]);

  const handleCheckboxClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
    },
    []
  );

  const handleCheckboxChange = useCallback(() => {
    onToggleCheck?.(testCase.id);
  }, [onToggleCheck, testCase.id]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-accent',
        className
      )}
      onClick={handleClick}
    >
      {/* Checkbox */}
      {onToggleCheck && (
        <div onClick={handleCheckboxClick}>
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheckboxChange}
          />
        </div>
      )}

      {/* Template Icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
        {getTemplateIcon(testCase.templateType)}
      </div>

      {/* Title and ID */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">TC-{testCase.id.slice(0, 8)}</span>
        </div>
        <h4 className="truncate text-sm font-medium">{testCase.title}</h4>
      </div>

      {/* Priority Badge */}
      <Badge variant={getPriorityVariant(testCase.priority)} className="shrink-0">
        {getPriorityLabel(testCase.priority)}
      </Badge>
    </div>
  );
};
