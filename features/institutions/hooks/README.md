# Institution Hooks Documentation

## useInstitutionStats

Hook para manejar estadísticas de una institución individual con caché inteligente y manejo de estados.

### Características

- ✅ Caché automático con duración de 5 minutos
- ✅ Manejo de estados de carga y error
- ✅ Detección de datos desactualizados
- ✅ Actualización forzada opcional
- ✅ Limpieza de errores
- ✅ Prevención de race conditions

### Uso Básico

```typescript
import { useInstitutionStats } from '@/features/institutions/hooks';

function InstitutionDashboard({ institutionId }: { institutionId: string }) {
  const { 
    stats, 
    loading, 
    error, 
    fetchStats, 
    refreshStats, 
    clearError,
    isStale 
  } = useInstitutionStats();

  useEffect(() => {
    fetchStats(institutionId);
  }, [institutionId, fetchStats]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No hay datos</div>;

  return (
    <div>
      <h2>Estadísticas</h2>
      <p>Cursos: {stats.courses_count}</p>
      <p>Estudiantes: {stats.students_count}</p>
      <p>Profesores: {stats.professors_count}</p>
      
      {isStale && <button onClick={refreshStats}>Actualizar</button>}
    </div>
  );
}
```

### API

#### Parámetros de fetchStats
- `institutionId: string` - ID de la institución
- `forceRefresh?: boolean` - Forzar actualización ignorando caché

#### Estados Retornados
- `stats: InstitutionStats | null` - Datos de estadísticas
- `loading: boolean` - Estado de carga
- `error: string | null` - Mensaje de error
- `lastFetched: Date | null` - Última actualización
- `isStale: boolean` - Si los datos están desactualizados

#### Métodos
- `fetchStats(id, forceRefresh?)` - Obtener estadísticas
- `refreshStats()` - Actualizar datos actuales
- `clearError()` - Limpiar estado de error

## useMultipleInstitutionStats

Hook para manejar estadísticas de múltiples instituciones simultáneamente.

### Uso

```typescript
import { useMultipleInstitutionStats } from '@/features/institutions/hooks';

function InstitutionsOverview({ institutionIds }: { institutionIds: string[] }) {
  const { statsMap, loading, error, refreshStats } = useMultipleInstitutionStats(institutionIds);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {institutionIds.map(id => {
        const stats = statsMap[id];
        return stats ? (
          <div key={id}>
            <h3>Institución {id}</h3>
            <p>Cursos: {stats.courses_count}</p>
          </div>
        ) : null;
      })}
    </div>
  );
}
```

## useInstitutionStatsRealtime

Hook para estadísticas en tiempo real con polling automático.

### Uso

```typescript
import { useInstitutionStatsRealtime } from '@/features/institutions/hooks';

function RealtimeStats({ institutionId }: { institutionId: string }) {
  const { 
    stats, 
    loading, 
    error, 
    isPolling, 
    startPolling, 
    stopPolling 
  } = useInstitutionStatsRealtime(institutionId, 30000); // 30 segundos

  return (
    <div>
      <div>
        <button onClick={startPolling} disabled={isPolling}>
          Iniciar Monitoreo
        </button>
        <button onClick={stopPolling} disabled={!isPolling}>
          Detener Monitoreo
        </button>
        {isPolling && <span>🔴 En vivo</span>}
      </div>
      
      {stats && (
        <div>
          <p>Cursos: {stats.courses_count}</p>
          <p>Estudiantes: {stats.students_count}</p>
        </div>
      )}
    </div>
  );
}
```

## Utilidades

### clearInstitutionStatsCache()

Limpia todo el caché de estadísticas. Útil para logout o actualización completa de datos.

```typescript
import { clearInstitutionStatsCache } from '@/features/institutions/hooks';

// En logout o cambio de contexto
clearInstitutionStatsCache();
```

## Estructura de Datos

### InstitutionStats

```typescript
interface InstitutionStats {
  courses_count: number;
  students_count: number;
  professors_count: number;
  recent_activity: InstitutionActivity[];
}
```

### InstitutionActivity

```typescript
interface InstitutionActivity {
  id: string;
  type: 'course_created' | 'student_enrolled' | 'professor_assigned' | 'institution_updated';
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}
```

## Endpoints API

- `GET /api/institutions/[id]/stats` - Estadísticas individuales
- `POST /api/institutions/stats/batch` - Estadísticas múltiples

## Consideraciones de Rendimiento

- **Caché**: Los datos se cachean por 5 minutos automáticamente
- **Batch Loading**: Use `useMultipleInstitutionStats` para múltiples instituciones
- **Polling**: Use con moderación, el polling por defecto es cada 30 segundos
- **Race Conditions**: El hook previene automáticamente condiciones de carrera

## Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useInstitutionStats } from '../use-institution-stats';

test('should fetch stats successfully', async () => {
  const { result } = renderHook(() => useInstitutionStats());
  
  await act(async () => {
    await result.current.fetchStats('test-id');
  });
  
  expect(result.current.stats).toBeDefined();
  expect(result.current.loading).toBe(false);
});
```