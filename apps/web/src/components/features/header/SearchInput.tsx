import { type FC, useState, useCallback, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface SearchInputProps {
  className?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
}

/**
 * Search input component for the header with keyboard navigation support.
 * Provides a quick way to search across the application.
 */
export const SearchInput: FC<SearchInputProps> = ({
  className,
  placeholder = 'Search...',
  onSearch,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((): void => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        // Default behavior: navigate to search results page
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  }, [query, onSearch, navigate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        handleSearch();
      }
      if (event.key === 'Escape') {
        setQuery('');
        (event.target as HTMLInputElement).blur();
      }
    },
    [handleSearch]
  );

  const handleClear = useCallback((): void => {
    setQuery('');
  }, []);

  return (
    <div
      className={cn(
        'relative flex items-center transition-all duration-200',
        isFocused ? 'w-64' : 'w-48',
        className
      )}
    >
      <Input
        type="search"
        size="sm"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          query ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 pointer-events-auto hover:bg-transparent"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          ) : undefined
        }
        className="pr-8"
        aria-label="Search"
      />
    </div>
  );
};
