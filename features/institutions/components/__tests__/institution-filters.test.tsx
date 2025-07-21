import { render, screen, fireEvent } from '@testing-library/react';
import { InstitutionFilters } from '../institution-filters';
import { InstitutionFilters as IInstitutionFilters } from '../../types';

describe('InstitutionFilters', () => {
  const mockFilters: IInstitutionFilters = {
    search: '',
    dateRange: { from: null, to: null },
    sortBy: 'created_at',
    sortOrder: 'desc',
  };

  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filters button', () => {
    render(
      <InstitutionFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument();
  });

  it('shows active filters count when provided', () => {
    render(
      <InstitutionFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        activeFiltersCount={2}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows clear filters button when there are active filters', () => {
    render(
      <InstitutionFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        activeFiltersCount={1}
      />
    );

    expect(screen.getByRole('button', { name: /limpiar filtros/i })).toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', () => {
    render(
      <InstitutionFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        activeFiltersCount={1}
      />
    );

    const clearButton = screen.getByRole('button', { name: /limpiar filtros/i });
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('opens filter popover when filters button is clicked', () => {
    render(
      <InstitutionFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const filtersButton = screen.getByRole('button', { name: /filtros/i });
    fireEvent.click(filtersButton);

    expect(screen.getByText('Fecha de creación')).toBeInTheDocument();
    expect(screen.getByText('Ordenar por')).toBeInTheDocument();
  });

  it('shows filter chips for active date range', () => {
    const filtersWithDateRange: IInstitutionFilters = {
      ...mockFilters,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      },
    };

    render(
      <InstitutionFilters
        filters={filtersWithDateRange}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        activeFiltersCount={1}
      />
    );

    expect(screen.getByText(/Fecha:/)).toBeInTheDocument();
  });

  it('shows filter chip for non-default sorting', () => {
    const filtersWithSorting: IInstitutionFilters = {
      ...mockFilters,
      sortBy: 'name',
      sortOrder: 'asc',
    };

    render(
      <InstitutionFilters
        filters={filtersWithSorting}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        activeFiltersCount={1}
      />
    );

    expect(screen.getByText(/Ordenar: Nombre/)).toBeInTheDocument();
  });
});