import { type FC, useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Textarea } from '@/components/ui';
import type { TestStep } from '@/types';

/**
 * Generate a unique ID for a new step.
 */
function generateStepId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Props for the StepsEditor component.
 */
export interface StepsEditorProps {
  steps: TestStep[];
  onChange: (steps: TestStep[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Editor component for test case steps.
 * Allows adding, editing, removing, and reordering steps.
 */
export const StepsEditor: FC<StepsEditorProps> = ({
  steps,
  onChange,
  disabled,
  className,
}) => {
  const handleAddStep = useCallback(() => {
    const newStep: TestStep = {
      id: generateStepId(),
      content: '',
      expected: '',
    };
    onChange([...steps, newStep]);
  }, [steps, onChange]);

  const handleRemoveStep = useCallback(
    (index: number) => {
      const newSteps = steps.filter((_, i) => i !== index);
      onChange(newSteps);
    },
    [steps, onChange]
  );

  const handleStepChange = useCallback(
    (index: number, field: 'content' | 'expected', value: string) => {
      const newSteps = steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      );
      onChange(newSteps);
    },
    [steps, onChange]
  );

  const handleMoveStep = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= steps.length) return;

      const newSteps = [...steps];
      const [movedStep] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, movedStep);
      onChange(newSteps);
    },
    [steps, onChange]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Steps list */}
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="relative flex gap-3 rounded-lg border bg-card p-4"
        >
          {/* Drag handle and step number */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              className="cursor-grab text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
              disabled={disabled}
              onMouseDown={(e) => {
                // Basic drag-to-reorder using mouse movement
                e.preventDefault();
                const startY = e.clientY;
                const startIndex = index;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaY = moveEvent.clientY - startY;
                  const stepHeight = 180; // Approximate height of a step
                  const indexDelta = Math.round(deltaY / stepHeight);
                  if (indexDelta !== 0) {
                    handleMoveStep(startIndex, startIndex + indexDelta);
                  }
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Step Action
              </label>
              <Textarea
                value={step.content}
                onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                placeholder="Describe the action to perform..."
                rows={2}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Expected Result
              </label>
              <Textarea
                value={step.expected}
                onChange={(e) => handleStepChange(index, 'expected', e.target.value)}
                placeholder="Describe the expected outcome..."
                rows={2}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemoveStep(index)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add step button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddStep}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Step
      </Button>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No steps added yet. Click "Add Step" to create your first test step.
          </p>
        </div>
      )}
    </div>
  );
};
