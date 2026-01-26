import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './Alert';

describe('Alert', () => {
  it('should render children', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should have role="alert"', () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply info variant styles by default', () => {
    render(<Alert>Info alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50');
    expect(alert).toHaveClass('border-blue-200');
    expect(alert).toHaveClass('text-blue-800');
  });

  it('should apply info variant styles explicitly', () => {
    render(<Alert variant="info">Info alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50');
    expect(alert).toHaveClass('border-blue-200');
    expect(alert).toHaveClass('text-blue-800');
  });

  it('should apply success variant styles', () => {
    render(<Alert variant="success">Success alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50');
    expect(alert).toHaveClass('border-green-200');
    expect(alert).toHaveClass('text-green-800');
  });

  it('should apply warning variant styles', () => {
    render(<Alert variant="warning">Warning alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50');
    expect(alert).toHaveClass('border-yellow-200');
    expect(alert).toHaveClass('text-yellow-800');
  });

  it('should apply error variant styles', () => {
    render(<Alert variant="error">Error alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('border-red-200');
    expect(alert).toHaveClass('text-red-800');
  });

  it('should render icon when provided', () => {
    render(
      <Alert icon={<svg data-testid="alert-icon" />}>
        Alert with icon
      </Alert>
    );
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>With ref</Alert>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<Alert data-testid="test-alert">Props</Alert>);
    expect(screen.getByTestId('test-alert')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<Alert>Base</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('relative');
    expect(alert).toHaveClass('w-full');
    expect(alert).toHaveClass('rounded-lg');
    expect(alert).toHaveClass('border');
    expect(alert).toHaveClass('p-4');
  });
});

describe('AlertTitle', () => {
  it('should render children', () => {
    render(<AlertTitle>Title text</AlertTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('should render as h5 element', () => {
    render(<AlertTitle>Heading</AlertTitle>);
    const heading = screen.getByRole('heading', { level: 5 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading');
  });

  it('should apply base styles', () => {
    render(<AlertTitle>Styled Title</AlertTitle>);
    const title = screen.getByText('Styled Title');
    expect(title).toHaveClass('mb-1');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('should apply custom className', () => {
    render(<AlertTitle className="custom-title">Custom</AlertTitle>);
    expect(screen.getByText('Custom')).toHaveClass('custom-title');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<AlertTitle ref={ref}>With ref</AlertTitle>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<AlertTitle data-testid="test-title">Props</AlertTitle>);
    expect(screen.getByTestId('test-title')).toBeInTheDocument();
  });
});

describe('AlertDescription', () => {
  it('should render children', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should render as p element', () => {
    render(<AlertDescription>Paragraph</AlertDescription>);
    const description = screen.getByText('Paragraph');
    expect(description.tagName).toBe('P');
  });

  it('should apply base styles', () => {
    render(<AlertDescription>Styled Description</AlertDescription>);
    const description = screen.getByText('Styled Description');
    expect(description).toHaveClass('text-sm');
  });

  it('should apply custom className', () => {
    render(<AlertDescription className="custom-desc">Custom</AlertDescription>);
    expect(screen.getByText('Custom')).toHaveClass('custom-desc');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<AlertDescription ref={ref}>With ref</AlertDescription>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<AlertDescription data-testid="test-desc">Props</AlertDescription>);
    expect(screen.getByTestId('test-desc')).toBeInTheDocument();
  });
});

describe('Alert composition', () => {
  it('should render Alert with AlertTitle and AlertDescription', () => {
    render(
      <Alert variant="success">
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Success!');
    expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
  });

  it('should render Alert with icon and composed children', () => {
    render(
      <Alert variant="error" icon={<svg data-testid="error-icon" />}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    );

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Error');
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
