import { useCallback, useEffect, useState } from 'react';
import type { ToastProps, ToastActionElement } from '@/components/ui/Toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

const listeners: Array<(state: ToastState) => void> = [];

let memoryState: ToastState = { toasts: [] };

let count = 0;

function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function dispatch(action: ToastAction): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string): void {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
}

export type ToastInput = Omit<ToasterToast, 'id'>;

export interface ToastReturn {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
}

function toast(props: ToastInput): ToastReturn {
  const id = genId();

  const update = (updateProps: Partial<ToasterToast>): void =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...updateProps, id },
    });

  const dismiss = (): void => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

export interface UseToastReturn {
  toasts: ToasterToast[];
  toast: (props: ToastInput) => ToastReturn;
  dismiss: (toastId?: string) => void;
}

export function useToast(): UseToastReturn {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    dispatch({ type: 'DISMISS_TOAST', toastId });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}

export { toast };
