import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any remaining toasts
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
  });

  it('should add a toast with description', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a description',
      });
    });

    expect(result.current.toasts[0].description).toBe('This is a description');
  });

  it('should add a toast with variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Success Toast',
        variant: 'success',
      });
    });

    expect(result.current.toasts[0].variant).toBe('success');
  });

  it('should return toast id', () => {
    const { result } = renderHook(() => useToast());
    let toastReturn: { id: string } | undefined;

    act(() => {
      toastReturn = result.current.toast({ title: 'Test Toast' });
    });

    expect(toastReturn).toBeDefined();
    expect(toastReturn!.id).toBeDefined();
    expect(typeof toastReturn!.id).toBe('string');
  });

  it('should dismiss a specific toast by id', () => {
    const { result } = renderHook(() => useToast());
    let toast1Return: { id: string } | undefined;

    act(() => {
      toast1Return = result.current.toast({ title: 'Toast 1' });
    });

    act(() => {
      result.current.toast({ title: 'Toast 2' });
    });

    expect(result.current.toasts).toHaveLength(2);

    // Toast 2 is at index 0 (newest first), Toast 1 is at index 1
    const toast2 = result.current.toasts.find((t) => t.id !== toast1Return!.id);

    act(() => {
      result.current.dismiss(toast1Return!.id);
    });

    const dismissedToast = result.current.toasts.find((t) => t.id === toast1Return!.id);
    const otherToast = result.current.toasts.find((t) => t.id === toast2!.id);

    expect(dismissedToast!.open).toBe(false);
    expect(otherToast!.open).toBe(true);
  });

  it('should dismiss all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.dismiss();
    });

    result.current.toasts.forEach((t) => {
      expect(t.open).toBe(false);
    });
  });

  it('should remove toast after dismiss delay', async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());
    let toastReturn: { update: (props: { title: string }) => void } | undefined;

    act(() => {
      toastReturn = result.current.toast({ title: 'Original' });
    });

    expect(result.current.toasts[0].title).toBe('Original');

    act(() => {
      toastReturn!.update({ title: 'Updated' });
    });

    expect(result.current.toasts[0].title).toBe('Updated');
  });

  it('should limit number of toasts to 5', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.toast({ title: `Toast ${i}` });
      }
    });

    expect(result.current.toasts).toHaveLength(5);
  });

  it('should add new toasts to the beginning', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First' });
    });

    act(() => {
      result.current.toast({ title: 'Second' });
    });

    expect(result.current.toasts[0].title).toBe('Second');
    expect(result.current.toasts[1].title).toBe('First');
  });

  it('should sync state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useToast());
    const { result: result2 } = renderHook(() => useToast());

    act(() => {
      result1.current.toast({ title: 'Shared Toast' });
    });

    expect(result1.current.toasts).toHaveLength(1);
    expect(result2.current.toasts).toHaveLength(1);
    expect(result2.current.toasts[0].title).toBe('Shared Toast');
  });

  it('should set open to true when adding toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });

    expect(result.current.toasts[0].open).toBe(true);
  });

  it('should call onOpenChange with false when closing', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });

    const toast = result.current.toasts[0];
    const openBefore = toast.open;
    expect(openBefore).toBe(true);

    act(() => {
      toast.onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });
});

describe('toast function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any remaining toasts
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should be callable directly without hook', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Direct Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Direct Toast');
  });

  it('should return dismiss function', () => {
    const { result } = renderHook(() => useToast());
    let toastReturn: { dismiss: () => void } | undefined;

    act(() => {
      toastReturn = toast({ title: 'Test Toast' });
    });

    expect(toastReturn!.dismiss).toBeDefined();
    expect(typeof toastReturn!.dismiss).toBe('function');

    act(() => {
      toastReturn!.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should return update function', () => {
    const { result } = renderHook(() => useToast());
    let toastReturn: { update: (props: { title: string }) => void } | undefined;

    act(() => {
      toastReturn = toast({ title: 'Original' });
    });

    expect(toastReturn!.update).toBeDefined();
    expect(typeof toastReturn!.update).toBe('function');

    act(() => {
      toastReturn!.update({ title: 'Updated via function' });
    });

    expect(result.current.toasts[0].title).toBe('Updated via function');
  });
});
