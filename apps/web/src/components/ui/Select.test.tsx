import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

// Helper to render a basic select with options
function renderSelect(props: React.ComponentProps<typeof Select> = {}) {
  return render(
    <Select {...props}>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  describe('rendering', () => {
    it('should render select trigger', () => {
      renderSelect({ placeholder: 'Select a fruit' });
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display placeholder when no value is selected', () => {
      renderSelect({ placeholder: 'Select a fruit' });
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    });

    it('should display selected value', () => {
      renderSelect({ defaultValue: 'apple', placeholder: 'Select a fruit' });
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderSelect({ placeholder: 'Select a fruit' });

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should display all options when opened', async () => {
      const user = userEvent.setup();
      renderSelect({ placeholder: 'Select a fruit' });

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Orange' })).toBeInTheDocument();
      });
    });

    it('should call onValueChange when option is selected', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      renderSelect({ placeholder: 'Select a fruit', onValueChange: handleValueChange });

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      expect(handleValueChange).toHaveBeenCalledWith('banana');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      renderSelect({ placeholder: 'Select a fruit' });

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Apple' }));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      renderSelect({ placeholder: 'Select a fruit' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-input');
    });

    it('should apply error variant styles', () => {
      renderSelect({ placeholder: 'Select a fruit', variant: 'error' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-destructive');
    });

    it('should apply error variant when error prop is provided', () => {
      renderSelect({ placeholder: 'Select a fruit', error: 'Selection required' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-destructive');
    });
  });

  describe('sizes', () => {
    it('should apply default size classes', () => {
      renderSelect({ placeholder: 'Select a fruit' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-10');
    });

    it('should apply small size classes', () => {
      renderSelect({ placeholder: 'Select a fruit', size: 'sm' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-9');
    });

    it('should apply large size classes', () => {
      renderSelect({ placeholder: 'Select a fruit', size: 'lg' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-11');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      renderSelect({ placeholder: 'Select a fruit', error: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should set aria-invalid when error is present', () => {
      renderSelect({ placeholder: 'Select a fruit', error: 'Error message' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error and id are provided', () => {
      renderSelect({ id: 'fruit-select', error: 'Invalid selection' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-describedby', 'fruit-select-error');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'fruit-select-error');
    });
  });

  describe('custom className', () => {
    it('should apply custom className to trigger', () => {
      renderSelect({ className: 'custom-class' });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-class');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      renderSelect({ disabled: true });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      renderSelect({ disabled: true });

      await user.click(screen.getByRole('combobox'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      const { rerender } = render(
        <Select value="apple" onValueChange={handleValueChange}>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Apple')).toBeInTheDocument();

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      expect(handleValueChange).toHaveBeenCalledWith('banana');

      // Rerender with new value to simulate parent updating state
      rerender(
        <Select value="banana" onValueChange={handleValueChange}>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });
  });
});

describe('SelectGroup and SelectLabel', () => {
  it('should render grouped options with labels', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Select a fruit">
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    });
  });
});

describe('SelectSeparator', () => {
  it('should render separator between items', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Select">
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectSeparator data-testid="separator" />
          <SelectItem value="item2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('bg-muted');
    });
  });
});

describe('SelectItem', () => {
  it('should render disabled item', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Select a fruit">
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>Banana</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      const disabledOption = screen.getByRole('option', { name: 'Banana' });
      expect(disabledOption).toHaveAttribute('data-disabled');
    });
  });

  it('should not select disabled item', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(
      <Select placeholder="Select a fruit" onValueChange={handleValueChange}>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>Banana</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    });

    // Try to click disabled option
    const disabledOption = screen.getByRole('option', { name: 'Banana' });
    fireEvent.click(disabledOption);

    expect(handleValueChange).not.toHaveBeenCalled();
  });
});

describe('SelectTrigger', () => {
  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Select>
        <SelectTrigger ref={ref}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test">Test</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('SelectContent', () => {
  it('should forward ref', async () => {
    const ref = vi.fn();
    const user = userEvent.setup();
    render(
      <Select placeholder="Select">
        <SelectContent ref={ref}>
          <SelectItem value="test">Test</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(ref).toHaveBeenCalled();
    });
  });
});
