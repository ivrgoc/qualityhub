import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('should render a textarea element', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle change events', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant styles', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-input');
  });

  it('should apply error variant styles', () => {
    render(<Textarea variant="error" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-destructive');
  });

  it('should apply error variant when error prop is provided', () => {
    render(<Textarea error="This field is required" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-destructive');
  });

  it('should display error message', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('should set aria-invalid when error is present', () => {
    render(<Textarea error="Error message" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should set aria-describedby when error and id are provided', () => {
    render(<Textarea id="description" error="Invalid content" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'description-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'description-error');
  });

  it('should apply default size classes', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[80px]');
  });

  it('should apply small size classes', () => {
    render(<Textarea size="sm" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[60px]');
  });

  it('should apply large size classes', () => {
    render(<Textarea size="lg" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[120px]');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional HTML attributes', () => {
    render(
      <Textarea
        name="description"
        required
        maxLength={500}
        rows={5}
        data-testid="textarea"
      />
    );
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('name', 'description');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('maxlength', '500');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  describe('auto-resize', () => {
    beforeEach(() => {
      // Mock getComputedStyle for consistent testing
      vi.spyOn(window, 'getComputedStyle').mockImplementation(
        () =>
          ({
            lineHeight: '20px',
            paddingTop: '8px',
            paddingBottom: '8px',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
          }) as CSSStyleDeclaration
      );
    });

    it('should apply resize-none class when autoResize is enabled', () => {
      render(<Textarea autoResize data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should apply overflow-hidden class when autoResize is enabled', () => {
      render(<Textarea autoResize data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('overflow-hidden');
    });

    it('should not apply resize-none class when autoResize is disabled', () => {
      render(<Textarea autoResize={false} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).not.toHaveClass('resize-none');
    });

    it('should call onChange handler when content changes with autoResize enabled', () => {
      const handleChange = vi.fn();
      render(<Textarea autoResize onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new content' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should accept minRows prop', () => {
      render(<Textarea autoResize minRows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should accept maxRows prop', () => {
      render(<Textarea autoResize maxRows={10} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should handle controlled value changes', () => {
      const { rerender } = render(
        <Textarea autoResize value="initial" data-testid="textarea" onChange={() => {}} />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('initial');

      rerender(
        <Textarea autoResize value="updated content" data-testid="textarea" onChange={() => {}} />
      );
      expect(textarea).toHaveValue('updated content');
    });

    it('should work with defaultValue', () => {
      render(<Textarea autoResize defaultValue="default text" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('default text');
    });
  });

  describe('with error and auto-resize combined', () => {
    it('should render error message with auto-resize enabled', () => {
      render(
        <Textarea
          autoResize
          error="Content is too short"
          data-testid="textarea"
        />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-none');
      expect(screen.getByText('Content is too short')).toBeInTheDocument();
    });

    it('should maintain correct styling with error and auto-resize', () => {
      render(
        <Textarea
          autoResize
          error="Required field"
          data-testid="textarea"
        />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-destructive');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('ref handling', () => {
    it('should handle callback ref', () => {
      let refElement: HTMLTextAreaElement | null = null;
      render(<Textarea ref={(el) => { refElement = el; }} />);
      expect(refElement).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should handle object ref', () => {
      const ref = { current: null };
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
