import { type FC } from 'react';
import { Trash2, FolderInput, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui';

/**
 * Props for the BulkActionsBar component.
 */
export interface BulkActionsBarProps {
  selectedCount: number;
  isDeleting?: boolean;
  isMoving?: boolean;
  onMove: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  className?: string;
}

/**
 * Floating action bar that appears when items are selected.
 * Provides bulk move and delete operations.
 */
export const BulkActionsBar: FC<BulkActionsBarProps> = ({
  selectedCount,
  isDeleting,
  isMoving,
  onMove,
  onDelete,
  onClearSelection,
  className,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        className
      )}
    >
      {/* Selection count */}
      <div className="flex items-center gap-2 border-r pr-3">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          disabled={isMoving || isDeleting}
        >
          <FolderInput className="mr-2 h-4 w-4" />
          {isMoving ? 'Moving...' : 'Move to...'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting || isMoving}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
};
