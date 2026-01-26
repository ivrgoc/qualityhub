import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Search, Mail, Eye } from 'lucide-react';
import { Input } from './Input';

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle change events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-input');
  });

  it('should apply error variant styles', () => {
    render(<Input variant="error" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-destructive');
  });

  it('should apply error variant when error prop is provided', () => {
    render(<Input error="This field is required" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-destructive');
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('should set aria-invalid when error is present', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should set aria-describedby when error and id are provided', () => {
    render(<Input id="email" error="Invalid email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
  });

  it('should apply default size classes', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-10');
  });

  it('should apply small size classes', () => {
    render(<Input size="sm" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-9');
  });

  it('should apply large size classes', () => {
    render(<Input size="lg" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-11');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should use text type by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should accept different input types', () => {
    render(<Input type="email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  describe('with icons', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      render(<Input rightIcon={<Eye data-testid="right-icon" />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should render both left and right icons', () => {
      render(
        <Input
          leftIcon={<Mail data-testid="left-icon" />}
          rightIcon={<Eye data-testid="right-icon" />}
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should apply left padding when left icon is present', () => {
      render(<Input leftIcon={<Search />} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pl-10');
    });

    it('should apply right padding when right icon is present', () => {
      render(<Input rightIcon={<Eye />} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pr-10');
    });

    it('should apply muted foreground color to icons by default', () => {
      const { container } = render(
        <Input leftIcon={<Search data-testid="left-icon" />} />
      );
      const iconContainer = container.querySelector('.text-muted-foreground');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply destructive color to icons when error is present', () => {
      const { container } = render(
        <Input
          leftIcon={<Search data-testid="left-icon" />}
          error="Error message"
        />
      );
      const iconContainer = container.querySelector('.text-destructive');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('input with error and icon combined', () => {
    it('should render error message with icon', () => {
      render(
        <Input
          leftIcon={<Mail data-testid="icon" />}
          error="Invalid email address"
        />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('should maintain correct styling with error and icons', () => {
      render(
        <Input
          leftIcon={<Mail />}
          rightIcon={<Eye />}
          error="Required field"
          data-testid="input"
        />
      );
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
      expect(input).toHaveClass('pl-10');
      expect(input).toHaveClass('pr-10');
    });
  });

  it('should pass through additional HTML attributes', () => {
    render(
      <Input
        name="email"
        autoComplete="email"
        required
        maxLength={100}
        data-testid="input"
      />
    );
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('maxlength', '100');
  });
});
