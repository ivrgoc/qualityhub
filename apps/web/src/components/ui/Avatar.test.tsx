import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Avatar,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from './Avatar';
import { getInitials } from '@/utils/avatar';

describe('getInitials', () => {
  it('should return single initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should return two initials for two names', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should return first and last initials for multiple names', () => {
    expect(getInitials('John William Doe')).toBe('JD');
  });

  it('should handle lowercase names', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should handle extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });

  it('should return empty string for empty input', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });
});

describe('Avatar', () => {
  describe('rendering', () => {
    it('should render with fallback initials from name', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render with custom fallback content', () => {
      render(<Avatar fallback="?" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should prefer custom fallback over name initials', () => {
      render(<Avatar name="John Doe" fallback="Custom" />);
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.queryByText('JD')).not.toBeInTheDocument();
    });

    it('should render fallback when no src is provided', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render empty fallback when no name or fallback provided', () => {
      const { container } = render(<Avatar data-testid="avatar" />);
      const fallback = container.querySelector('[class*="bg-muted"]');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toBeEmptyDOMElement();
    });

    it('should still show fallback when src provided but image not loaded', () => {
      // In jsdom, images don't load, so fallback should always show
      render(<Avatar src="https://example.com/avatar.jpg" name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should apply xs size classes', () => {
      render(<Avatar name="John Doe" size="xs" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-6', 'w-6');
    });

    it('should apply sm size classes', () => {
      render(<Avatar name="John Doe" size="sm" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-8', 'w-8');
    });

    it('should apply default size classes', () => {
      render(<Avatar name="John Doe" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-10', 'w-10');
    });

    it('should apply lg size classes', () => {
      render(<Avatar name="John Doe" size="lg" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-12', 'w-12');
    });

    it('should apply xl size classes', () => {
      render(<Avatar name="John Doe" size="xl" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-16', 'w-16');
    });
  });

  describe('custom className', () => {
    it('should apply custom className to Avatar', () => {
      render(<Avatar name="John Doe" className="custom-class" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to Avatar', () => {
      const ref = vi.fn();
      render(<Avatar name="John Doe" ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('AvatarRoot', () => {
  it('should render with default rounded-full class', () => {
    render(<AvatarRoot data-testid="avatar-root">Content</AvatarRoot>);
    expect(screen.getByTestId('avatar-root')).toHaveClass('rounded-full');
  });

  it('should apply size variant classes', () => {
    render(
      <AvatarRoot size="lg" data-testid="avatar-root">
        Content
      </AvatarRoot>
    );
    expect(screen.getByTestId('avatar-root')).toHaveClass('h-12', 'w-12');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<AvatarRoot ref={ref}>Content</AvatarRoot>);
    expect(ref).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <AvatarRoot className="custom-root-class" data-testid="avatar-root">
        Content
      </AvatarRoot>
    );
    expect(screen.getByTestId('avatar-root')).toHaveClass('custom-root-class');
  });

  it('should render children', () => {
    render(<AvatarRoot data-testid="avatar-root">Test Content</AvatarRoot>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('AvatarImage', () => {
  // Note: Radix Avatar doesn't render the img element until the image loads successfully.
  // In jsdom, images never load, so we test the component structure instead.
  it('should accept src and alt props', () => {
    // This test verifies the component accepts the props without crashing
    const { container } = render(
      <AvatarRoot>
        <AvatarImage src="https://example.com/img.jpg" alt="Test image" />
        <AvatarFallback>FB</AvatarFallback>
      </AvatarRoot>
    );
    // Fallback should be rendered since image won't load in jsdom
    expect(screen.getByText('FB')).toBeInTheDocument();
    // The avatar root should be rendered
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('should accept custom className prop', () => {
    // Test that component accepts className without crashing
    expect(() =>
      render(
        <AvatarRoot>
          <AvatarImage
            src="https://example.com/img.jpg"
            alt="Test"
            className="custom-img-class"
          />
          <AvatarFallback>FB</AvatarFallback>
        </AvatarRoot>
      )
    ).not.toThrow();
  });
});

describe('AvatarFallback', () => {
  it('should render fallback content', () => {
    render(
      <AvatarRoot>
        <AvatarFallback>AB</AvatarFallback>
      </AvatarRoot>
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('should apply bg-muted class', () => {
    render(
      <AvatarRoot>
        <AvatarFallback data-testid="fallback">AB</AvatarFallback>
      </AvatarRoot>
    );
    expect(screen.getByTestId('fallback')).toHaveClass('bg-muted');
  });

  it('should apply custom className', () => {
    render(
      <AvatarRoot>
        <AvatarFallback className="custom-fallback" data-testid="fallback">
          AB
        </AvatarFallback>
      </AvatarRoot>
    );
    expect(screen.getByTestId('fallback')).toHaveClass('custom-fallback');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <AvatarRoot>
        <AvatarFallback ref={ref}>AB</AvatarFallback>
      </AvatarRoot>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should render children correctly', () => {
    render(
      <AvatarRoot>
        <AvatarFallback>
          <span data-testid="icon">Icon</span>
        </AvatarFallback>
      </AvatarRoot>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should apply flex centering classes for content alignment', () => {
    render(
      <AvatarRoot>
        <AvatarFallback data-testid="fallback">AB</AvatarFallback>
      </AvatarRoot>
    );
    const fallback = screen.getByTestId('fallback');
    expect(fallback).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
