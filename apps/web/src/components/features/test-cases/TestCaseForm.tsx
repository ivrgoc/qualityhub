import { type FC, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { StepsEditor } from './StepsEditor';
import { BddEditor } from './BddEditor';
import type { TestCase, TestStep, TestCaseTemplate, Priority } from '@/types';

/**
 * Zod schema for test step validation.
 */
const testStepSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Step content is required'),
  expected: z.string(),
});

/**
 * Zod schema for test case form validation.
 */
const testCaseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(500, 'Title is too long'),
  templateType: z.enum(['steps', 'text', 'bdd', 'exploratory']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  preconditions: z.string().optional(),
  steps: z.array(testStepSchema).optional(),
  expectedResult: z.string().optional(),
  estimate: z.number().min(0).optional().nullable(),
  sectionId: z.string().min(1, 'Section is required'),
});

/**
 * Type for test case form values.
 */
export type TestCaseFormValues = z.infer<typeof testCaseFormSchema>;

/**
 * Props for the TestCaseForm component.
 */
export interface TestCaseFormProps {
  testCase?: TestCase | null;
  sectionId?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TestCaseFormValues) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TEMPLATE_OPTIONS: { value: TestCaseTemplate; label: string; description: string }[] = [
  {
    value: 'steps',
    label: 'Steps',
    description: 'Step-by-step test with actions and expected results',
  },
  {
    value: 'text',
    label: 'Text',
    description: 'Free-form text description',
  },
  {
    value: 'bdd',
    label: 'BDD/Gherkin',
    description: 'Given/When/Then format',
  },
  {
    value: 'exploratory',
    label: 'Exploratory',
    description: 'Charter-based exploratory testing',
  },
];

/**
 * Form component for creating and editing test cases.
 * Supports different template types with appropriate editors.
 */
export const TestCaseForm: FC<TestCaseFormProps> = ({
  testCase,
  sectionId,
  isSubmitting,
  onSubmit,
  onCancel,
  className,
}) => {
  const isEditing = !!testCase;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues: {
      title: testCase?.title ?? '',
      templateType: testCase?.templateType ?? 'steps',
      priority: testCase?.priority ?? 'medium',
      preconditions: testCase?.preconditions ?? '',
      steps: testCase?.steps ?? [],
      expectedResult: testCase?.expectedResult ?? '',
      estimate: testCase?.estimate ?? null,
      sectionId: testCase?.sectionId ?? sectionId ?? '',
    },
  });

  // Reset form when testCase changes
  useEffect(() => {
    if (testCase) {
      reset({
        title: testCase.title,
        templateType: testCase.templateType,
        priority: testCase.priority,
        preconditions: testCase.preconditions ?? '',
        steps: testCase.steps ?? [],
        expectedResult: testCase.expectedResult ?? '',
        estimate: testCase.estimate ?? null,
        sectionId: testCase.sectionId,
      });
    }
  }, [testCase, reset]);

  const templateType = watch('templateType');

  const handleFormSubmit = useCallback(
    async (values: TestCaseFormValues) => {
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('flex flex-col h-full', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">
          {isEditing ? 'Edit Test Case' : 'New Test Case'}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter test case title"
            error={errors.title?.message}
          />
        </div>

        {/* Template Type & Priority */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Template Type <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name="templateType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Priority <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Estimate */}
        <div>
          <label htmlFor="estimate" className="mb-1.5 block text-sm font-medium">
            Time Estimate (minutes)
          </label>
          <Input
            id="estimate"
            type="number"
            min={0}
            {...register('estimate', { valueAsNumber: true })}
            placeholder="e.g., 15"
          />
        </div>

        {/* Preconditions */}
        <div>
          <label htmlFor="preconditions" className="mb-1.5 block text-sm font-medium">
            Preconditions
          </label>
          <Textarea
            id="preconditions"
            {...register('preconditions')}
            placeholder="List any preconditions or setup steps..."
            rows={3}
          />
        </div>

        {/* Template-specific content */}
        {templateType === 'steps' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Test Steps</label>
            <Controller
              control={control}
              name="steps"
              render={({ field }) => (
                <StepsEditor
                  steps={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        {templateType === 'bdd' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Gherkin Scenario</label>
            <Controller
              control={control}
              name="expectedResult"
              render={({ field }) => (
                <BddEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        {(templateType === 'text' || templateType === 'exploratory') && (
          <div>
            <label htmlFor="expectedResult" className="mb-1.5 block text-sm font-medium">
              {templateType === 'exploratory' ? 'Test Charter' : 'Expected Result'}
            </label>
            <Textarea
              id="expectedResult"
              {...register('expectedResult')}
              placeholder={
                templateType === 'exploratory'
                  ? 'Describe the mission and areas to explore...'
                  : 'Describe the expected outcome...'
              }
              rows={8}
            />
          </div>
        )}

        {/* Overall Expected Result for steps template */}
        {templateType === 'steps' && (
          <div>
            <label htmlFor="expectedResult" className="mb-1.5 block text-sm font-medium">
              Overall Expected Result
            </label>
            <Textarea
              id="expectedResult"
              {...register('expectedResult')}
              placeholder="Describe the overall expected outcome after all steps..."
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Test Case'}
        </Button>
      </div>
    </form>
  );
};
