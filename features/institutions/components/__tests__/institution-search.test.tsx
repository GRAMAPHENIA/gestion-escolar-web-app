import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionSearch } from '../institution-search';

// Mock the hooks
jest.mock('../hooks/use-institution-search', () => ({
  useInstitutionSearchSuggestions: jest.fn(() => ({
    suggestions: ['Universidad Nacional', 'Instituto Tecnológico'],
    loading: false,
  })),
  useInstitutionSearchHistory: jest.fn(() => ({
    searchHistory: ['Búsqueda anterior'],
    addToHistory: jest.fn(),
    clearHistory: jest.fn(),
    removeFromHistory: jest.fn(),
  })),
}));

describe('InstitutionSearch', () => {
  const mockOnChange = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(
      <InstitutionSearch
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        placeholder="Buscar instituciones..."
      />
    );

    expect(screen.getByPlaceholderText('Buscar instituciones...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    render(
      <InstitutionSearch
        value=""
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Universidad' } });

    expect(mockOnChange).toHaveBeenCalledWith('Universidad');
  });

  it('calls onSearch when pressing Enter', () => {
    render(
      <InstitutionSearch
        value="Universidad"
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSearch).toHaveBeenCalledWith('Universidad');
  });

  it('shows clear button when there is a value', () => {
    render(
      <InstitutionSearch
        value="Universidad"
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />
    );

    expect(screen.getByRole('button', { name: /limpiar búsqueda/i })).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(
      <InstitutionSearch
        value="Universidad"
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />
    );

    const clearButton = screen.getByRole('button', { name: /limpiar búsqueda/i });
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('shows loading indicator when isSearching is true', () => {
    render(
      <InstitutionSearch
        value="Universidad"
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        isSearching={true}
      />
    );

    // Check for loading spinner (div with animate-spin class)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});