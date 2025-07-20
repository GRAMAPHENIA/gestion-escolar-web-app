# Design Document - Gestión de Instituciones

## Overview

El módulo de Gestión de Instituciones implementará una interfaz completa para administrar instituciones educativas dentro del sistema. El diseño se basa en los patrones existentes de la aplicación, utilizando Next.js 15, React 19, Tailwind CSS, y componentes Radix UI, manteniendo consistencia con el tema oscuro y la estética moderna ya establecida.

La arquitectura seguirá el patrón de features modulares existente, integrándose seamlessly con Clerk para autenticación, Supabase para persistencia de datos, y el sistema de navegación del dashboard actual.

## Architecture

### Component Hierarchy
```
/features/institutions/
├── components/
│   ├── institution-list.tsx          # Lista principal con tabla y filtros
│   ├── institution-card.tsx          # Tarjeta individual para vista grid
│   ├── institution-form.tsx          # Formulario para crear/editar
│   ├── institution-detail.tsx        # Vista detallada de institución
│   ├── institution-delete-dialog.tsx # Diálogo de confirmación
│   ├── institution-search.tsx        # Componente de búsqueda
│   ├── institution-filters.tsx       # Panel de filtros avanzados
│   └── institution-export.tsx        # Opciones de exportación
├── hooks/
│   ├── use-institutions.ts           # Hook para operaciones CRUD
│   ├── use-institution-stats.ts      # Hook para estadísticas
│   └── use-institution-search.ts     # Hook para búsqueda y filtros
├── types/
│   └── institution.ts                # Tipos TypeScript
└── utils/
    ├── institution-validation.ts     # Esquemas de validación Zod
    └── institution-export.ts         # Utilidades de exportación
```

### Page Structure
```
/app/dashboard/instituciones/
├── page.tsx                          # Lista principal de instituciones
├── nueva/
│   └── page.tsx                      # Página para crear institución
├── [id]/
│   ├── page.tsx                      # Vista detallada
│   └── editar/
│       └── page.tsx                  # Página de edición
└── loading.tsx                       # Estado de carga
```

## Components and Interfaces

### Core Data Types

```typescript
interface Institution {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  courses_count?: number;
  students_count?: number;
  professors_count?: number;
}

interface InstitutionFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface InstitutionFilters {
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: 'name' | 'created_at' | 'courses_count';
  sortOrder: 'asc' | 'desc';
}
```

### Key Components Design

#### InstitutionList Component
- **Purpose**: Componente principal que muestra la lista de instituciones
- **Features**: 
  - Tabla responsive con paginación
  - Búsqueda en tiempo real
  - Filtros avanzados
  - Acciones rápidas (ver, editar, eliminar)
  - Estados de carga y error
- **Props**: `institutions`, `loading`, `onSearch`, `onFilter`, `onSort`

#### InstitutionForm Component
- **Purpose**: Formulario reutilizable para crear y editar instituciones
- **Features**:
  - Validación en tiempo real con Zod
  - Estados de carga durante submit
  - Manejo de errores
  - Auto-save draft (opcional)
- **Props**: `institution?`, `onSubmit`, `onCancel`, `loading`

#### InstitutionDetail Component
- **Purpose**: Vista detallada con información completa y estadísticas
- **Features**:
  - Información básica de la institución
  - Estadísticas (cursos, profesores, alumnos)
  - Lista de cursos asociados
  - Timeline de actividad reciente
  - Acciones (editar, eliminar)
- **Props**: `institution`, `stats`, `recentActivity`

### State Management Strategy

#### Custom Hooks Pattern
```typescript
// use-institutions.ts
export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createInstitution = async (data: InstitutionFormData) => { /* ... */ };
  const updateInstitution = async (id: string, data: InstitutionFormData) => { /* ... */ };
  const deleteInstitution = async (id: string) => { /* ... */ };
  const fetchInstitutions = async (filters?: InstitutionFilters) => { /* ... */ };

  return {
    institutions,
    loading,
    error,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    fetchInstitutions,
  };
}
```

## Data Models

### Database Integration

#### Supabase Queries
```sql
-- Obtener instituciones con estadísticas
SELECT 
  i.*,
  COUNT(DISTINCT c.id) as courses_count,
  COUNT(DISTINCT s.id) as students_count,
  COUNT(DISTINCT p.id) as professors_count
FROM institutions i
LEFT JOIN courses c ON c.institution_id = i.id
LEFT JOIN students s ON s.course_id = c.id
LEFT JOIN professors p ON p.institution_id = i.id
GROUP BY i.id
ORDER BY i.created_at DESC;

-- Búsqueda con filtros
SELECT * FROM institutions 
WHERE name ILIKE '%search%' 
  AND created_at BETWEEN date_from AND date_to
ORDER BY name ASC;
```

#### API Routes Structure
```typescript
// /app/api/institutions/route.ts
export async function GET(request: Request) {
  // Obtener lista con filtros y paginación
}

export async function POST(request: Request) {
  // Crear nueva institución
}

// /app/api/institutions/[id]/route.ts
export async function GET(params: { id: string }) {
  // Obtener institución específica con estadísticas
}

export async function PUT(params: { id: string }, request: Request) {
  // Actualizar institución
}

export async function DELETE(params: { id: string }) {
  // Eliminar institución
}
```

### Validation Schemas

```typescript
// institution-validation.ts
export const institutionSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  address: z.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .optional(),
  email: z.string()
    .email('Formato de email inválido')
    .optional(),
});
```

## Error Handling

### Error Boundaries
- Implementar error boundaries específicos para el módulo de instituciones
- Manejo graceful de errores de red y base de datos
- Mensajes de error user-friendly con acciones de recuperación

### Validation Strategy
- Validación client-side con Zod para feedback inmediato
- Validación server-side para seguridad
- Mensajes de error contextuales y específicos

### Loading States
- Skeleton loaders para listas y detalles
- Spinners para acciones específicas
- Estados de error con opciones de retry

## Testing Strategy

### Unit Tests
- Componentes individuales con React Testing Library
- Hooks personalizados con renderHook
- Utilidades de validación y transformación

### Integration Tests
- Flujos completos de CRUD
- Interacciones entre componentes
- Integración con API routes

### E2E Tests (Opcional)
- Flujos críticos de usuario
- Casos de error y recuperación
- Responsive design en diferentes dispositivos

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Componentes de exportación y filtros avanzados
- **Memoization**: React.memo para componentes de lista
- **Virtual Scrolling**: Para listas muy grandes (>1000 items)
- **Debounced Search**: Búsqueda con delay de 300ms
- **Pagination**: Límite de 20 instituciones por página

### Caching Strategy
- React Query para cache de datos
- Invalidación automática después de mutaciones
- Cache de búsquedas frecuentes

### Bundle Optimization
- Code splitting por rutas
- Tree shaking de utilidades no utilizadas
- Optimización de imágenes con Next.js Image

## Security Considerations

### Authentication & Authorization
- Verificación de autenticación con Clerk en todas las rutas
- Middleware de autorización para operaciones sensibles
- Rate limiting en API routes

### Data Validation
- Sanitización de inputs en server-side
- Validación de permisos antes de operaciones CRUD
- Protección contra SQL injection con Supabase RLS

### Privacy & Data Protection
- Logs de auditoría para operaciones críticas
- Encriptación de datos sensibles
- Cumplimiento con regulaciones de privacidad

## Accessibility Features

### WCAG Compliance
- Navegación por teclado completa
- Roles ARIA apropiados
- Contraste de colores accesible
- Screen reader compatibility

### User Experience
- Focus management en modales y formularios
- Indicadores de estado claros
- Mensajes de error descriptivos
- Shortcuts de teclado para acciones frecuentes

## Integration Points

### Existing System Integration
- Navegación seamless con el dashboard actual
- Consistencia visual con el tema oscuro existente
- Integración con el sistema de notificaciones
- Compatibilidad con el layout responsive actual

### Future Extensibility
- Hooks reutilizables para otros módulos
- Componentes base para otras entidades
- Patrones de diseño escalables
- API structure extensible para nuevas funcionalidades