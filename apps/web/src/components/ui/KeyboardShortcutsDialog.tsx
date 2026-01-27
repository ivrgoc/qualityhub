import { type FC, useEffect, useState, useCallback } from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { cn } from '@/utils/cn';

/**
 * Shortcut definition
 */
interface Shortcut {
  keys: string[];
  description: string;
}

/**
 * Shortcut group definition
 */
interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'H'], description: 'Go to Dashboard (Home)' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'T'], description: 'Go to Test Cases' },
      { keys: ['G', 'R'], description: 'Go to Test Runs' },
      { keys: ['G', 'M'], description: 'Go to Milestones' },
      { keys: ['G', 'S'], description: 'Go to Settings' },
    ],
  },
  {
    title: 'Test Execution',
    shortcuts: [
      { keys: ['P'], description: 'Mark test as Passed' },
      { keys: ['F'], description: 'Mark test as Failed' },
      { keys: ['B'], description: 'Mark test as Blocked' },
      { keys: ['S'], description: 'Mark test as Skipped' },
      { keys: ['N', '↓'], description: 'Next test' },
      { keys: ['K', '↑'], description: 'Previous test' },
      { keys: ['E'], description: 'Edit result comment' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['/', 'Ctrl', 'K'], description: 'Open search' },
      { keys: ['Escape'], description: 'Close dialog / Cancel' },
      { keys: ['Ctrl', 'S'], description: 'Save current form' },
      { keys: ['Ctrl', 'N'], description: 'Create new item' },
    ],
  },
  {
    title: 'Test Cases',
    shortcuts: [
      { keys: ['C'], description: 'Create new test case' },
      { keys: ['E'], description: 'Edit selected test case' },
      { keys: ['D'], description: 'Delete selected test case' },
      { keys: ['Ctrl', 'A'], description: 'Select all test cases' },
      { keys: ['Space'], description: 'Toggle selection' },
    ],
  },
];

/**
 * Single keyboard key badge component
 */
const KeyBadge: FC<{ children: string }> = ({ children }) => (
  <kbd
    className={cn(
      'inline-flex items-center justify-center',
      'min-w-[24px] h-6 px-1.5',
      'rounded border border-border bg-muted',
      'font-mono text-xs font-medium',
      'shadow-sm'
    )}
  >
    {children}
  </kbd>
);

/**
 * Shortcut row component
 */
const ShortcutRow: FC<{ shortcut: Shortcut }> = ({ shortcut }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
    <div className="flex items-center gap-1">
      {shortcut.keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <KeyBadge>{key}</KeyBadge>
        </span>
      ))}
    </div>
  </div>
);

/**
 * Shortcut group component
 */
const ShortcutGroupSection: FC<{ group: ShortcutGroup }> = ({ group }) => (
  <div className="space-y-2">
    <h3 className="font-medium text-sm">{group.title}</h3>
    <div className="space-y-1">
      {group.shortcuts.map((shortcut, index) => (
        <ShortcutRow key={index} shortcut={shortcut} />
      ))}
    </div>
  </div>
);

/**
 * Props for KeyboardShortcutsDialog
 */
export interface KeyboardShortcutsDialogProps {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog showing all available keyboard shortcuts.
 * Opens when user presses '?' key.
 */
export const KeyboardShortcutsDialog: FC<KeyboardShortcutsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(open ?? false);

  // Sync with controlled prop
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle open state change
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  // Listen for '?' key to open dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        handleOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and perform actions quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {SHORTCUT_GROUPS.map((group, index) => (
              <ShortcutGroupSection key={index} group={group} />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <KeyBadge>?</KeyBadge> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
