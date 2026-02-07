import { type FC, useCallback, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { Textarea } from '@/components/ui';

/**
 * Gherkin keywords for syntax highlighting hints.
 */
const GHERKIN_KEYWORDS = [
  'Feature:',
  'Scenario:',
  'Scenario Outline:',
  'Background:',
  'Given',
  'When',
  'Then',
  'And',
  'But',
  'Examples:',
  '@',
];

/**
 * Example Gherkin template.
 */
const GHERKIN_TEMPLATE = `Feature: [Feature Name]

  Scenario: [Scenario Description]
    Given [precondition]
    When [action]
    Then [expected result]
`;

/**
 * Props for the BddEditor component.
 */
export interface BddEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Editor component for BDD/Gherkin syntax test cases.
 * Provides a styled textarea with syntax hints.
 */
export const BddEditor: FC<BddEditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleInsertTemplate = useCallback(() => {
    if (!value.trim()) {
      onChange(GHERKIN_TEMPLATE);
    }
  }, [value, onChange]);

  // Count lines for line numbers display
  const lineCount = useMemo(() => {
    return value.split('\n').length;
  }, [value]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar with hints */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Keywords:</span>
          {GHERKIN_KEYWORDS.slice(0, 6).map((keyword) => (
            <code
              key={keyword}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
            >
              {keyword}
            </code>
          ))}
        </div>
        {!value.trim() && (
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={handleInsertTemplate}
            disabled={disabled}
          >
            Insert template
          </button>
        )}
      </div>

      {/* Editor with line numbers */}
      <div className="relative rounded-md border bg-muted/30 overflow-hidden">
        {/* Line numbers */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 border-r bg-muted/50 text-right select-none pointer-events-none pt-3 pr-2 text-xs text-muted-foreground font-mono overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: Math.max(lineCount, 10) }).map((_, i) => (
            <div key={i} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder ?? GHERKIN_TEMPLATE}
          disabled={disabled}
          className={cn(
            'min-h-[300px] pl-14 font-mono text-sm leading-6 resize-y',
            'bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
            'rounded-none'
          )}
          rows={15}
        />
      </div>

      {/* Validation hints */}
      {value && (
        <div className="text-xs text-muted-foreground">
          {!value.includes('Given') && !value.includes('When') && !value.includes('Then') && (
            <span className="text-yellow-600 dark:text-yellow-500">
              Tip: Include Given/When/Then steps for a complete scenario
            </span>
          )}
        </div>
      )}
    </div>
  );
};
