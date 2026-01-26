import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './Toast';

const renderToast = (ui: React.ReactNode) => {
  return render(
    <ToastProvider>
      {ui}
      <ToastViewport />
    </ToastProvider>
  );
};

describe('Toast', () => {
  it('should render children', () => {
    renderToast(
      <Toast open>
        <ToastTitle>Test Toast</ToastTitle>
      </Toast>
    );
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    renderToast(
      <Toast open data-testid="toast">
        Default toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-background');
    expect(toast).toHaveClass('border');
  });

  it('should apply success variant styles', () => {
    renderToast(
      <Toast open variant="success" data-testid="toast">
        Success toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-green-50');
    expect(toast).toHaveClass('border-green-200');
    expect(toast).toHaveClass('text-green-800');
  });

  it('should apply error variant styles', () => {
    renderToast(
      <Toast open variant="error" data-testid="toast">
        Error toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-red-50');
    expect(toast).toHaveClass('border-red-200');
    expect(toast).toHaveClass('text-red-800');
  });

  it('should apply warning variant styles', () => {
    renderToast(
      <Toast open variant="warning" data-testid="toast">
        Warning toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-yellow-50');
    expect(toast).toHaveClass('border-yellow-200');
    expect(toast).toHaveClass('text-yellow-800');
  });

  it('should apply info variant styles', () => {
    renderToast(
      <Toast open variant="info" data-testid="toast">
        Info toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-blue-50');
    expect(toast).toHaveClass('border-blue-200');
    expect(toast).toHaveClass('text-blue-800');
  });

  it('should apply custom className', () => {
    renderToast(
      <Toast open className="custom-class" data-testid="toast">
        Custom toast
      </Toast>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    renderToast(
      <Toast open ref={ref}>
        With ref
      </Toast>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    renderToast(
      <Toast open data-testid="test-toast">
        Props test
      </Toast>
    );
    expect(screen.getByTestId('test-toast')).toBeInTheDocument();
  });
});

describe('ToastTitle', () => {
  it('should render children', () => {
    renderToast(
      <Toast open>
        <ToastTitle>Title text</ToastTitle>
      </Toast>
    );
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('should apply base styles', () => {
    renderToast(
      <Toast open>
        <ToastTitle data-testid="title">Styled Title</ToastTitle>
      </Toast>
    );
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-sm');
    expect(title).toHaveClass('font-semibold');
  });

  it('should apply custom className', () => {
    renderToast(
      <Toast open>
        <ToastTitle className="custom-title">Custom</ToastTitle>
      </Toast>
    );
    expect(screen.getByText('Custom')).toHaveClass('custom-title');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    renderToast(
      <Toast open>
        <ToastTitle ref={ref}>With ref</ToastTitle>
      </Toast>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('ToastDescription', () => {
  it('should render children', () => {
    renderToast(
      <Toast open>
        <ToastDescription>Description text</ToastDescription>
      </Toast>
    );
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should apply base styles', () => {
    renderToast(
      <Toast open>
        <ToastDescription data-testid="description">Styled</ToastDescription>
      </Toast>
    );
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('opacity-90');
  });

  it('should apply custom className', () => {
    renderToast(
      <Toast open>
        <ToastDescription className="custom-desc">Custom</ToastDescription>
      </Toast>
    );
    expect(screen.getByText('Custom')).toHaveClass('custom-desc');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    renderToast(
      <Toast open>
        <ToastDescription ref={ref}>With ref</ToastDescription>
      </Toast>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('ToastClose', () => {
  it('should render close button', () => {
    renderToast(
      <Toast open>
        <ToastClose data-testid="close-button" />
      </Toast>
    );
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  it('should call onOpenChange when clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderToast(
      <Toast open onOpenChange={onOpenChange}>
        <ToastClose data-testid="close-button" />
      </Toast>
    );

    await user.click(screen.getByTestId('close-button'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should apply custom className', () => {
    renderToast(
      <Toast open>
        <ToastClose className="custom-close" data-testid="close-button" />
      </Toast>
    );
    expect(screen.getByTestId('close-button')).toHaveClass('custom-close');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    renderToast(
      <Toast open>
        <ToastClose ref={ref} />
      </Toast>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('ToastAction', () => {
  it('should render action button', () => {
    renderToast(
      <Toast open>
        <ToastAction altText="Undo action">Undo</ToastAction>
      </Toast>
    );
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('should apply base styles', () => {
    renderToast(
      <Toast open>
        <ToastAction altText="Action" data-testid="action">
          Action
        </ToastAction>
      </Toast>
    );
    const action = screen.getByTestId('action');
    expect(action).toHaveClass('inline-flex');
    expect(action).toHaveClass('h-8');
    expect(action).toHaveClass('rounded-md');
  });

  it('should apply custom className', () => {
    renderToast(
      <Toast open>
        <ToastAction altText="Custom" className="custom-action">
          Custom
        </ToastAction>
      </Toast>
    );
    expect(screen.getByText('Custom')).toHaveClass('custom-action');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    renderToast(
      <Toast open>
        <ToastAction altText="Ref test" ref={ref}>
          With ref
        </ToastAction>
      </Toast>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderToast(
      <Toast open>
        <ToastAction altText="Click test" onClick={onClick}>
          Click me
        </ToastAction>
      </Toast>
    );

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('ToastViewport', () => {
  it('should render viewport', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    );
    expect(screen.getByTestId('viewport')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ToastProvider>
        <ToastViewport className="custom-viewport" data-testid="viewport" />
      </ToastProvider>
    );
    expect(screen.getByTestId('viewport')).toHaveClass('custom-viewport');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <ToastProvider>
        <ToastViewport ref={ref} />
      </ToastProvider>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('Toast composition', () => {
  it('should render complete toast with title, description, and action', () => {
    renderToast(
      <Toast open variant="success">
        <div className="grid gap-1">
          <ToastTitle>Success!</ToastTitle>
          <ToastDescription>Your changes have been saved.</ToastDescription>
        </div>
        <ToastAction altText="Undo">Undo</ToastAction>
        <ToastClose />
      </Toast>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    renderToast(
      <>
        <Toast open>
          <ToastTitle>First toast</ToastTitle>
        </Toast>
        <Toast open>
          <ToastTitle>Second toast</ToastTitle>
        </Toast>
      </>
    );

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });
});
