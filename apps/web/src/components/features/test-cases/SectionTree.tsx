import { type FC, useState, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Skeleton,
} from '@/components/ui';
import type { Section } from '@/store/api/testSuitesApi';

/**
 * Props for the SectionTreeItem component.
 */
interface SectionTreeItemProps {
  section: Section;
  level: number;
  selectedSectionId?: string;
  expandedIds: Set<string>;
  onSelect: (sectionId: string) => void;
  onToggleExpand: (sectionId: string) => void;
  onAddSubsection: (parentId: string) => void;
  onEdit: (section: Section) => void;
  onDelete: (sectionId: string) => void;
}

/**
 * Individual section item with expand/collapse and context menu.
 */
const SectionTreeItem: FC<SectionTreeItemProps> = ({
  section,
  level,
  selectedSectionId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddSubsection,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = section.children && section.children.length > 0;
  const isExpanded = expandedIds.has(section.id);
  const isSelected = selectedSectionId === section.id;

  const handleClick = useCallback(() => {
    onSelect(section.id);
  }, [onSelect, section.id]);

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(section.id);
    },
    [onToggleExpand, section.id]
  );

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
          'hover:bg-accent',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
          onClick={handleToggleExpand}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          )}
        </button>

        {/* Folder Icon */}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Section Name */}
        <span className="flex-1 truncate text-sm">{section.name}</span>

        {/* Test Case Count */}
        {section.testCaseCount !== undefined && section.testCaseCount > 0 && (
          <span className="text-xs text-muted-foreground">{section.testCaseCount}</span>
        )}

        {/* Context Menu */}
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAddSubsection(section.id)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Subsection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(section)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(section.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {section.children!.map((child) => (
            <SectionTreeItem
              key={child.id}
              section={child}
              level={level + 1}
              selectedSectionId={selectedSectionId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddSubsection={onAddSubsection}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Props for the SectionTree component.
 */
export interface SectionTreeProps {
  sections: Section[];
  selectedSectionId?: string;
  expandedIds: Set<string>;
  isLoading?: boolean;
  onSelect: (sectionId: string | undefined) => void;
  onToggleExpand: (sectionId: string) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onAddSection: (parentId?: string) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
  className?: string;
}

/**
 * Tree view component for displaying and navigating test case sections.
 * Supports expand/collapse, selection, and CRUD operations via context menu.
 */
export const SectionTree: FC<SectionTreeProps> = ({
  sections,
  selectedSectionId,
  expandedIds,
  isLoading,
  onSelect,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onAddSection,
  onEditSection,
  onDeleteSection,
  className,
}) => {
  // Handle "All Test Cases" selection (clear section filter)
  const handleSelectAll = useCallback(() => {
    onSelect(undefined);
  }, [onSelect]);

  if (isLoading) {
    return (
      <div className={cn('space-y-2 p-2', className)}>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Sections</span>
        <div className="flex items-center gap-1">
          {onExpandAll && onCollapseAll && sections.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onExpandAll}
              >
                Expand
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onCollapseAll}
              >
                Collapse
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onAddSection()}
            title="Add section"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto p-2">
        {/* All Test Cases option */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 cursor-pointer transition-colors',
            'hover:bg-accent',
            !selectedSectionId && 'bg-accent text-accent-foreground'
          )}
          onClick={handleSelectAll}
        >
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">All Test Cases</span>
        </div>

        {/* Section tree */}
        {sections.length > 0 ? (
          <div className="mt-1">
            {sections.map((section) => (
              <SectionTreeItem
                key={section.id}
                section={section}
                level={0}
                selectedSectionId={selectedSectionId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                onAddSubsection={onAddSection}
                onEdit={onEditSection}
                onDelete={onDeleteSection}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>No sections yet.</p>
            <Button
              variant="link"
              size="sm"
              className="mt-1"
              onClick={() => onAddSection()}
            >
              Create your first section
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
