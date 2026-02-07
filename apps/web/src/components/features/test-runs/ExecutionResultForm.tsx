import { type FC, useState, useCallback, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Textarea, Input } from '@/components/ui';
import { StatusSelector } from './StatusSelector';
import type { TestStatus, TestResult } from '@/types';

/**
 * Props for the ExecutionResultForm component.
 */
export interface ExecutionResultFormProps {
  existingResult?: TestResult;
  isSubmitting?: boolean;
  onSubmit: (status: TestStatus, comment?: string, elapsedSeconds?: number) => void;
  className?: string;
}

/**
 * Form for recording test execution results.
 * Includes status selection, comment, and elapsed time.
 */
export const ExecutionResultForm: FC<ExecutionResultFormProps> = ({
  existingResult,
  isSubmitting,
  onSubmit,
  className,
}) => {
  const [status, setStatus] = useState<TestStatus | undefined>(
    existingResult?.status === 'untested' ? undefined : existingResult?.status
  );
  const [comment, setComment] = useState(existingResult?.comment ?? '');
  const [elapsedMinutes, setElapsedMinutes] = useState<string>(
    existingResult?.elapsedSeconds ? String(Math.round(existingResult.elapsedSeconds / 60)) : ''
  );

  // Reset form when existing result changes
  useEffect(() => {
    setStatus(existingResult?.status === 'untested' ? undefined : existingResult?.status);
    setComment(existingResult?.comment ?? '');
    setElapsedMinutes(
      existingResult?.elapsedSeconds ? String(Math.round(existingResult.elapsedSeconds / 60)) : ''
    );
  }, [existingResult]);

  const handleSubmit = useCallback(() => {
    if (!status) return;

    const elapsedSeconds = elapsedMinutes
      ? Math.round(parseFloat(elapsedMinutes) * 60)
      : undefined;

    onSubmit(status, comment || undefined, elapsedSeconds);
  }, [status, comment, elapsedMinutes, onSubmit]);

  const handleStatusSelect = useCallback((newStatus: TestStatus) => {
    setStatus(newStatus);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">Result Status</label>
        <StatusSelector
          selectedStatus={status}
          onSelect={handleStatusSelect}
          disabled={isSubmitting}
          showShortcuts
          size="md"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Press the keyboard shortcut to quickly select a status
        </p>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-medium">
          Comment
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add notes about the test result..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {/* Elapsed Time */}
      <div>
        <label htmlFor="elapsed" className="mb-1.5 block text-sm font-medium">
          Elapsed Time (minutes)
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="elapsed"
            type="number"
            min={0}
            step={0.5}
            value={elapsedMinutes}
            onChange={(e) => setElapsedMinutes(e.target.value)}
            placeholder="e.g., 5"
            className="pl-9"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!status || isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? 'Saving...'
          : existingResult && existingResult.status !== 'untested'
          ? 'Update Result'
          : 'Save Result'}
      </Button>
    </div>
  );
};
