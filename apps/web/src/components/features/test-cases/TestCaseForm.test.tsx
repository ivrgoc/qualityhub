import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestCaseForm, type TestCaseFormValues } from './TestCaseForm';
import type { TestCase } from '@/types';

// Mock the StepsEditor and BddEditor components to simplify testing
vi.mock('./StepsEditor', () => ({
  StepsEditor: ({ steps, onChange }: { steps: unknown[]; onChange: (steps: unknown[]) => void }) => (
    <div data-testid="steps-editor">
      <span>Steps: {steps.length}</span>
      <button
        type="button"
        onClick={() => onChange([...steps, { id: 'new', content: 'New step', expected: '' }])}
      >
        Add Step
      </button>
    </div>
  ),
}));

vi.mock('./BddEditor', () => ({
  BddEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="bdd-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('TestCaseForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const defaultSectionId = 'section-123';

  const defaultProps = {
    sectionId: defaultSectionId,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form with all required fields', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/template type/i)).toBeInTheDocument();
      expect(screen.getByText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time estimate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preconditions/i)).toBeInTheDocument();
    });

    it('should show "New Test Case" title when creating', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByText('New Test Case')).toBeInTheDocument();
    });

    it('should show "Edit Test Case" title when editing', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'Existing Test Case',
        templateType: 'steps',
        priority: 'high',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
    });

    it('should populate form fields when editing existing test case', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'Login with valid credentials',
        templateType: 'steps',
        priority: 'critical',
        preconditions: 'User has an account',
        expectedResult: 'User is logged in',
        estimate: 15,
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByDisplayValue('Login with valid credentials')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User has an account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('should show steps editor when template type is steps', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByTestId('steps-editor')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create test case/i })).toBeInTheDocument();
    });

    it('should show "Save Changes" button when editing', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'Test',
        templateType: 'steps',
        priority: 'medium',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'ab');
      await user.clear(titleInput);

      // Try to submit with empty title
      const submitButton = screen.getByRole('button', { name: /create test case/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when title is too short', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'ab');

      const submitButton = screen.getByRole('button', { name: /create test case/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form values when valid', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<TestCaseForm {...defaultProps} />);

      // Fill in required fields
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New test case title');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create test case/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        const submittedValues: TestCaseFormValues = mockOnSubmit.mock.calls[0][0];
        expect(submittedValues.title).toBe('New test case title');
        expect(submittedValues.templateType).toBe('steps');
        expect(submittedValues.priority).toBe('medium');
        expect(submittedValues.sectionId).toBe(defaultSectionId);
      });
    });

    it('should disable submit button while submitting', () => {
      render(<TestCaseForm {...defaultProps} isSubmitting={true} />);

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable cancel button while submitting', () => {
      render(<TestCaseForm {...defaultProps} isSubmitting={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      // Find the X button in the header
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(
        (btn) => btn.querySelector('svg') && !btn.textContent?.includes('Cancel')
      );

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Template Type Switching', () => {
    it('should show steps editor for steps template', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByTestId('steps-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('bdd-editor')).not.toBeInTheDocument();
    });

    it('should show BDD editor for BDD template', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'BDD Test',
        templateType: 'bdd',
        priority: 'medium',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByTestId('bdd-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('steps-editor')).not.toBeInTheDocument();
    });

    it('should show textarea for text template', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'Text Test',
        templateType: 'text',
        priority: 'medium',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByLabelText(/expected result/i)).toBeInTheDocument();
      expect(screen.queryByTestId('steps-editor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bdd-editor')).not.toBeInTheDocument();
    });

    it('should show test charter textarea for exploratory template', () => {
      const testCase: TestCase = {
        id: 'tc-1',
        title: 'Exploratory Test',
        templateType: 'exploratory',
        priority: 'medium',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(<TestCaseForm {...defaultProps} testCase={testCase} />);

      expect(screen.getByLabelText(/test charter/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should allow entering estimate as a number', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const estimateInput = screen.getByLabelText(/time estimate/i);
      await user.type(estimateInput, '30');

      expect(estimateInput).toHaveValue(30);
    });

    it('should allow entering preconditions', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const preconditionsInput = screen.getByLabelText(/preconditions/i);
      await user.type(preconditionsInput, 'User must be logged in');

      expect(preconditionsInput).toHaveValue('User must be logged in');
    });
  });

  describe('Form Reset on Test Case Change', () => {
    it('should reset form when testCase prop changes', async () => {
      const testCase1: TestCase = {
        id: 'tc-1',
        title: 'First Test Case',
        templateType: 'steps',
        priority: 'high',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const testCase2: TestCase = {
        id: 'tc-2',
        title: 'Second Test Case',
        templateType: 'bdd',
        priority: 'low',
        version: 1,
        projectId: 'project-1',
        sectionId: 'section-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const { rerender } = render(<TestCaseForm {...defaultProps} testCase={testCase1} />);

      expect(screen.getByDisplayValue('First Test Case')).toBeInTheDocument();

      rerender(<TestCaseForm {...defaultProps} testCase={testCase2} />);

      expect(screen.getByDisplayValue('Second Test Case')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have required field indicators', () => {
      render(<TestCaseForm {...defaultProps} />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });

    it('should have proper labels for form inputs', () => {
      render(<TestCaseForm {...defaultProps} />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time estimate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preconditions/i)).toBeInTheDocument();
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when form is not dirty', () => {
      render(<TestCaseForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create test case/i });
      expect(submitButton).toBeDisabled();
    });

    it('should be enabled after user makes changes', async () => {
      const user = userEvent.setup();
      render(<TestCaseForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New test case');

      const submitButton = screen.getByRole('button', { name: /create test case/i });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
