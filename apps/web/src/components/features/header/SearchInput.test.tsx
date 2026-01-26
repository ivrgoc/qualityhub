import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SearchInput } from './SearchInput';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the search input', () => {
    renderWithRouter(<SearchInput />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    renderWithRouter(<SearchInput placeholder="Find something..." />);

    expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
  });

  it('should render with default placeholder', () => {
    renderWithRouter(<SearchInput />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should update value when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchInput />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test query');

    expect(input).toHaveValue('test query');
  });

  it('should call onSearch callback when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithRouter(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test query');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should navigate to search results when no onSearch callback', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchInput />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test query');
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('should not search when query is empty', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithRouter(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should not search when query is only whitespace', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithRouter(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should clear input when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchInput />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test query');
    expect(input).toHaveValue('test query');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
  });

  it('should show clear button when there is input', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchInput />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchInput />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should apply custom className', () => {
    const { container } = renderWithRouter(<SearchInput className="custom-search" />);

    expect(container.querySelector('.custom-search')).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    renderWithRouter(<SearchInput />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('should trim whitespace from search query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithRouter(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '  test query  ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});
