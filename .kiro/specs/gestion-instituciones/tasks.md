# Implementation Plan - Gestión de Instituciones

- [x] 1. Set up core data types and validation schemas
  - Create TypeScript interfaces for Institution and related types

  - Implement Zod validation schemas for form data
  - Create utility functions for data transformation
  - _Requirements: 1.1, 2.1, 3.1, 8.1_

- [x] 2. Implement Supabase integration and API routes





  - [x] 2.1 Create API route for fetching institutions list



    - Write GET /api/institutions with filtering and pagination
    - Implement search functionality with ILIKE queries
    - Add sorting and pagination logic
    - _Requirements: 2.1, 2.2, 6.1, 6.2_


  - [x] 2.2 Create API route for individual institution operations






    - Write GET /api/institutions/[id] for detailed view
    - Implement POST /api/institutions for creation
    - Add PUT /api/institutions/[id] for updates
    - Create DELETE /api/institutions/[id] with validation
    - _Requirements: 1.3, 3.3, 4.1, 5.4_


  - [x] 2.3 Implement institution statistics queries





    - Write complex query to get courses, students, and professors count
    - Create endpoint for institution dashboard metrics
    - Add recent activity timeline query
    - _Requirements: 4.2, 4.6_

- [x] 3. Create custom hooks for data management





  - [x] 3.1 Implement useInstitutions hook


    - Create hook for CRUD operations
    - Add loading and error state management
    - Implement optimistic updates for better UX
    - _Requirements: 1.3, 2.6, 3.3, 8.3_

  - [x] 3.2 Create useInstitutionSearch hook


    - Implement debounced search functionality
    - Add filter state management
    - Create sorting and pagination logic
    - _Requirements: 6.1, 6.2, 6.5_



  - [x] 3.3 Build useInstitutionStats hook






    - Fetch and manage institution statistics
    - Handle loading states for metrics
    - Cache frequently accessed data
    - _Requirements: 4.2, 4.4_

- [x] 4. Build core UI components





  - [x] 4.1 Create InstitutionForm component


    - Build reusable form with react-hook-form
    - Implement real-time validation with Zod
    - Add loading states and error handling
    - Create auto-save functionality for drafts
    - _Requirements: 1.2, 3.2, 8.1, 8.2_

  - [x] 4.2 Implement InstitutionCard component


    - Design card layout with institution info
    - Add quick action buttons (view, edit, delete)
    - Implement hover states and animations
    - Make component responsive for mobile
    - _Requirements: 2.1, 2.5_

  - [x] 4.3 Build InstitutionList component


    - Create responsive table layout
    - Implement sorting by clicking column headers
    - Add bulk selection functionality
    - Create empty state component
    - _Requirements: 2.1, 2.4, 6.3_

- [x] 5. Implement search and filtering functionality





  - [x] 5.1 Create InstitutionSearch component


    - Build search input with debounced functionality
    - Add search suggestions dropdown
    - Implement clear search functionality
    - _Requirements: 6.1, 6.2_

  - [x] 5.2 Build InstitutionFilters component


    - Create date range picker for creation date
    - Add sorting options dropdown
    - Implement filter chips to show active filters
    - Add clear all filters functionality
    - _Requirements: 6.3, 6.5, 6.6_

- [x] 6. Create detailed view and management pages





  - [x] 6.1 Implement InstitutionDetail component




    - Design detailed view layout with all institution info
    - Add statistics cards for courses, students, professors
    - Create associated courses list with navigation links
    - Implement recent activity timeline
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [x] 6.2 Build InstitutionDeleteDialog component




    - Create confirmation dialog with warning messages
    - Show consequences of deletion (associated data)
    - Implement soft delete option if needed
    - Add loading state during deletion
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 7. Implement export functionality





  - [ ] 7.1 Create InstitutionExport component
    - Build export options UI (Excel, PDF)
    - Implement file generation with current filters
    - Add progress indicators for large exports
    - Create download functionality


    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [ ] 7.2 Build export utility functions
    - Create Excel export with proper formatting
    - Implement PDF generation with professional layout
    - Add error handling for export failures
    - _Requirements: 7.2, 7.3, 7.6_

- [x] 8. Create page components and routing




  - [x] 8.1 Build main institutions list page




    - Create /app/dashboard/instituciones/page.tsx
    - Integrate search, filters, and list components
    - Add pagination controls
    - Implement loading and error states



    - _Requirements: 2.1, 2.6, 6.1_

  - [ ] 8.2 Create new institution page
    - Build /app/dashboard/instituciones/nueva/page.tsx



    - Integrate InstitutionForm for creation
    - Add navigation breadcrumbs
    - Implement success redirect after creation
    - _Requirements: 1.1, 1.6_



  - [ ] 8.3 Implement institution detail page
    - Create /app/dashboard/instituciones/[id]/page.tsx
    - Integrate InstitutionDetail component
    - Add edit and delete action buttons
    - Handle not found cases gracefully
    - _Requirements: 4.1, 4.5_

  - [ ] 8.4 Build institution edit page
    - Create /app/dashboard/instituciones/[id]/editar/page.tsx
    - Pre-populate form with existing data
    - Add cancel functionality with unsaved changes warning
    - Implement success feedback and navigation
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [ ] 9. Add comprehensive error handling and loading states
  - [ ] 9.1 Implement error boundaries
    - Create institution-specific error boundary
    - Add fallback UI for component errors
    - Implement error reporting and logging
    - _Requirements: 8.4, 8.5_

  - [ ] 9.2 Create loading components
    - Build skeleton loaders for list and detail views
    - Add spinner components for actions
    - Implement progressive loading for large datasets
    - _Requirements: 2.6, 8.3_

- [ ] 10. Implement validation and user feedback
  - [ ] 10.1 Add comprehensive form validation
    - Implement client-side validation with Zod
    - Add server-side validation for security
    - Create contextual error messages
    - _Requirements: 1.4, 1.5, 8.1, 8.2_

  - [ ] 10.2 Build notification system integration
    - Add success notifications for CRUD operations
    - Implement error notifications with retry options
    - Create confirmation dialogs for destructive actions
    - _Requirements: 1.3, 3.3, 5.2, 8.5_

- [ ] 11. Add responsive design and accessibility
  - [ ] 11.1 Implement responsive layouts
    - Make all components mobile-friendly
    - Add responsive table with horizontal scroll
    - Optimize touch interactions for mobile
    - _Requirements: 2.1, 4.1_

  - [ ] 11.2 Add accessibility features
    - Implement keyboard navigation for all components
    - Add ARIA labels and roles
    - Ensure proper focus management
    - Test with screen readers
    - _Requirements: 8.6_

- [ ] 12. Performance optimization and testing
  - [ ] 12.1 Implement performance optimizations
    - Add React.memo to prevent unnecessary re-renders
    - Implement virtual scrolling for large lists
    - Add debouncing for search and filters
    - Optimize bundle size with code splitting
    - _Requirements: 6.2, 6.5_

  - [ ] 12.2 Create comprehensive tests
    - Write unit tests for all components
    - Add integration tests for CRUD flows
    - Test error scenarios and edge cases
    - Implement accessibility testing
    - _Requirements: All requirements validation_

- [ ] 13. Integration with existing dashboard
  - [ ] 13.1 Update navigation and routing
    - Add institutions link to main navigation
    - Update dashboard statistics to include institutions
    - Create breadcrumb navigation for deep pages
    - _Requirements: 2.5, 4.5_

  - [ ] 13.2 Connect with dashboard overview
    - Update dashboard cards with real institution data
    - Add quick actions from dashboard to institutions
    - Implement recent institutions widget
    - _Requirements: 4.2, 4.4_