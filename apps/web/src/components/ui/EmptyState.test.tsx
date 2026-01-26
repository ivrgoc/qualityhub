import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render title as h3 element', () => {
    render(<EmptyState title="Empty State Title" />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Empty State Title');
  });

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No items"
        description="Try adding some items to get started."
      />
    );
    expect(
      screen.getByText('Try adding some items to get started.')
    ).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const description = container.querySelector('p');
    expect(description).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <EmptyState
        title="No results"
        icon={<svg data-testid="empty-icon" />}
      />
    );
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('should not render icon container when icon not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const iconContainer = container.querySelector('.mb-4.text-muted-foreground');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('should render action when provided', () => {
    render(
      <EmptyState
        title="No items"
        action={<button data-testid="action-button">Add Item</button>}
      />
    );
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('should not render action container when action not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const actionContainer = container.querySelector('.mt-6');
    expect(actionContainer).not.toBeInTheDocument();
  });

  it('should apply default size styles', () => {
    const { container } = render(<EmptyState title="Default size" />);
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('py-12');
    expect(emptyState).toHaveClass('px-6');
  });

  it('should apply sm size styles', () => {
    const { container } = render(<EmptyState title="Small size" size="sm" />);
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('py-8');
    expect(emptyState).toHaveClass('px-4');
  });

  it('should apply lg size styles', () => {
    const { container } = render(<EmptyState title="Large size" size="lg" />);
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('py-16');
    expect(emptyState).toHaveClass('px-8');
  });

  it('should have centered layout styles', () => {
    const { container } = render(<EmptyState title="Centered" />);
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('flex');
    expect(emptyState).toHaveClass('flex-col');
    expect(emptyState).toHaveClass('items-center');
    expect(emptyState).toHaveClass('justify-center');
    expect(emptyState).toHaveClass('text-center');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="Custom" className="custom-class" />
    );
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<EmptyState title="With ref" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<EmptyState title="Props" data-testid="test-empty-state" />);
    expect(screen.getByTestId('test-empty-state')).toBeInTheDocument();
  });

  it('should render all elements together', () => {
    render(
      <EmptyState
        title="No test cases"
        description="Create your first test case to get started."
        icon={<svg data-testid="test-icon" />}
        action={<button>Create Test Case</button>}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'No test cases' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Create your first test case to get started.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Test Case' })).toBeInTheDocument();
  });
});

describe('EmptyStateTitle', () => {
  it('should render children', () => {
    render(<EmptyStateTitle>Title text</EmptyStateTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('should render as h3 element', () => {
    render(<EmptyStateTitle>Heading</EmptyStateTitle>);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading');
  });

  it('should apply base styles', () => {
    render(<EmptyStateTitle>Styled Title</EmptyStateTitle>);
    const title = screen.getByText('Styled Title');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-foreground');
  });

  it('should apply custom className', () => {
    render(<EmptyStateTitle className="custom-title">Custom</EmptyStateTitle>);
    expect(screen.getByText('Custom')).toHaveClass('custom-title');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<EmptyStateTitle ref={ref}>With ref</EmptyStateTitle>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<EmptyStateTitle data-testid="test-title">Props</EmptyStateTitle>);
    expect(screen.getByTestId('test-title')).toBeInTheDocument();
  });
});

describe('EmptyStateDescription', () => {
  it('should render children', () => {
    render(<EmptyStateDescription>Description text</EmptyStateDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should render as p element', () => {
    render(<EmptyStateDescription>Paragraph</EmptyStateDescription>);
    const description = screen.getByText('Paragraph');
    expect(description.tagName).toBe('P');
  });

  it('should apply base styles', () => {
    render(
      <EmptyStateDescription>Styled Description</EmptyStateDescription>
    );
    const description = screen.getByText('Styled Description');
    expect(description).toHaveClass('mt-2');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
    expect(description).toHaveClass('max-w-md');
  });

  it('should apply custom className', () => {
    render(
      <EmptyStateDescription className="custom-desc">Custom</EmptyStateDescription>
    );
    expect(screen.getByText('Custom')).toHaveClass('custom-desc');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<EmptyStateDescription ref={ref}>With ref</EmptyStateDescription>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(
      <EmptyStateDescription data-testid="test-desc">Props</EmptyStateDescription>
    );
    expect(screen.getByTestId('test-desc')).toBeInTheDocument();
  });
});

describe('EmptyStateAction', () => {
  it('should render children', () => {
    render(<EmptyStateAction><button>Click me</button></EmptyStateAction>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should render as div element', () => {
    render(
      <EmptyStateAction data-testid="action-container">
        <button>Action</button>
      </EmptyStateAction>
    );
    const action = screen.getByTestId('action-container');
    expect(action.tagName).toBe('DIV');
  });

  it('should apply base styles', () => {
    render(
      <EmptyStateAction data-testid="styled-action">
        <button>Action</button>
      </EmptyStateAction>
    );
    const action = screen.getByTestId('styled-action');
    expect(action).toHaveClass('mt-6');
  });

  it('should apply custom className', () => {
    render(
      <EmptyStateAction className="custom-action">
        <button>Custom</button>
      </EmptyStateAction>
    );
    const action = screen.getByRole('button', { name: 'Custom' }).parentElement;
    expect(action).toHaveClass('custom-action');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <EmptyStateAction ref={ref}>
        <button>With ref</button>
      </EmptyStateAction>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(
      <EmptyStateAction data-testid="test-action">
        <button>Props</button>
      </EmptyStateAction>
    );
    expect(screen.getByTestId('test-action')).toBeInTheDocument();
  });
});
