/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionExport, InstitutionExportCompact } from '../institution-export';
import { InstitutionExportOptions } from '../../types';

// Mock de las funciones de exportación
jest.mock('../../utils/institution-export', () => ({
  exportInstitutions: jest.fn().mockResolvedValue(undefined),
  validateExportOptions: jest.fn().mockReturnValue([]),
}));

describe('InstitutionExport', () => {
  const mockOnExport = jest.fn();
  const defaultProps = {
    currentFilters: { search: '', sortBy: 'created_at', sortOrder: 'desc' },
    totalInstitutions: 10,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente el botón de exportación', () => {
    render(<InstitutionExport {...defaultProps} />);
    expect(screen.getByText('Exportar')).toBeInTheDocument();
  });

  test('abre el diálogo al hacer clic en el botón', async () => {
    render(<InstitutionExport {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Exportar'));
    
    await waitFor(() => {
      expect(screen.getByText('Exportar Instituciones')).toBeInTheDocument();
      expect(screen.getByText('Formato de Exportación')).toBeInTheDocument();
    });
  });

  test('muestra las opciones de formato correctamente', async () => {
    render(<InstitutionExport {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Exportar'));
    
    await waitFor(() => {
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
      expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument();
    });
  });

  test('llama a onExport con las opciones correctas al exportar', async () => {
    render(<InstitutionExport {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Exportar'));
    
    await waitFor(() => {
      expect(screen.getByText('Exportar 10 instituciones')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Exportar 10 instituciones'));
    
    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'excel',
        includeStats: true,
        filters: defaultProps.currentFilters,
      });
    });
  });
});

describe('InstitutionExportCompact', () => {
  const mockOnExport = jest.fn();
  const defaultProps = {
    currentFilters: { search: '', sortBy: 'created_at', sortOrder: 'desc' },
    totalInstitutions: 10,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente los botones compactos', () => {
    render(<InstitutionExportCompact {...defaultProps} />);
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  test('llama a onExport con el formato Excel al hacer clic en el botón Excel', async () => {
    render(<InstitutionExportCompact {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Excel'));
    
    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'excel',
        includeStats: true,
        filters: defaultProps.currentFilters,
      });
    });
  });

  test('llama a onExport con el formato PDF al hacer clic en el botón PDF', async () => {
    render(<InstitutionExportCompact {...defaultProps} />);
    
    fireEvent.click(screen.getByText('PDF'));
    
    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'pdf',
        includeStats: true,
        filters: defaultProps.currentFilters,
      });
    });
  });
});