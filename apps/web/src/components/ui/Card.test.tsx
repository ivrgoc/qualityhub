import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('text-card-foreground');
    expect(card).toHaveClass('shadow-sm');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content');
    expect(card).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<Card data-testid="test-card">Content</Card>);
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
    expect(header).toHaveClass('p-6');
  });

  it('should apply custom className', () => {
    render(<CardHeader className="custom-class">Content</CardHeader>);
    const header = screen.getByText('Content');
    expect(header).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>Content</CardHeader>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardTitle', () => {
  it('should render children', () => {
    render(<CardTitle>Title text</CardTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('should render as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Title');
  });

  it('should have base styles', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom-class">Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardDescription', () => {
  it('should render children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<CardDescription>Description</CardDescription>);
    const description = screen.getByText('Description');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should apply custom className', () => {
    render(
      <CardDescription className="custom-class">Description</CardDescription>
    );
    const description = screen.getByText('Description');
    expect(description).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>Description</CardDescription>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Content text</CardContent>);
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
  });

  it('should apply custom className', () => {
    render(<CardContent className="custom-class">Content</CardContent>);
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveClass('pt-0');
  });

  it('should apply custom className', () => {
    render(<CardFooter className="custom-class">Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('Card composition', () => {
  it('should render a complete card with all sections', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('full-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Test Card'
    );
    expect(
      screen.getByText('This is a test card description')
    ).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should allow card with only header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Simple Card</CardTitle>
        </CardHeader>
        <CardContent>Just content</CardContent>
      </Card>
    );

    expect(screen.getByText('Simple Card')).toBeInTheDocument();
    expect(screen.getByText('Just content')).toBeInTheDocument();
  });

  it('should allow card with only content', () => {
    render(
      <Card>
        <CardContent>Content only</CardContent>
      </Card>
    );

    expect(screen.getByText('Content only')).toBeInTheDocument();
  });
});
