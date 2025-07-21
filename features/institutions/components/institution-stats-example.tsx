/**
 * Example component demonstrating useInstitutionStats hook usage
 * This is for testing and documentation purposes
 */

'use client'

import { useEffect } from 'react'
import { useInstitutionStats, useMultipleInstitutionStats } from '../hooks'

interface InstitutionStatsExampleProps {
  institutionId: string
}

export function InstitutionStatsExample({ institutionId }: InstitutionStatsExampleProps) {
  const { 
    stats, 
    loading, 
    error, 
    fetchStats, 
    refreshStats, 
    clearError,
    isStale 
  } = useInstitutionStats()

  useEffect(() => {
    if (institutionId) {
      fetchStats(institutionId)
    }
  }, [institutionId, fetchStats])

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 mb-2">Error: {error}</p>
        <div className="space-x-2">
          <button 
            onClick={() => fetchStats(institutionId, true)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Reintentar
          </button>
          <button 
            onClick={clearError}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Limpiar Error
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-gray-500">No hay estadísticas disponibles</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Estadísticas de la Institución</h3>
        <div className="space-x-2">
          {isStale && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              Datos desactualizados
            </span>
          )}
          <button 
            onClick={refreshStats}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{stats.courses_count}</div>
          <div className="text-sm text-gray-600">Cursos</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">{stats.students_count}</div>
          <div className="text-sm text-gray-600">Estudiantes</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{stats.professors_count}</div>
          <div className="text-sm text-gray-600">Profesores</div>
        </div>
      </div>

      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Actividad Reciente</h4>
          <div className="space-y-2">
            {stats.recent_activity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="text-sm p-2 bg-gray-50 rounded">
                <p>{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Example component for multiple institutions stats
interface MultipleStatsExampleProps {
  institutionIds: string[]
}

export function MultipleInstitutionStatsExample({ institutionIds }: MultipleStatsExampleProps) {
  const { statsMap, loading, error, refreshStats, clearError } = useMultipleInstitutionStats(institutionIds)

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-2">
          {institutionIds.map((id) => (
            <div key={id} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 mb-2">Error: {error}</p>
        <div className="space-x-2">
          <button 
            onClick={refreshStats}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Reintentar
          </button>
          <button 
            onClick={clearError}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Limpiar Error
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Estadísticas de Múltiples Instituciones</h3>
        <button 
          onClick={refreshStats}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Actualizar Todo
        </button>
      </div>

      <div className="grid gap-4">
        {institutionIds.map((institutionId) => {
          const stats = statsMap[institutionId]
          
          if (!stats) {
            return (
              <div key={institutionId} className="p-4 border rounded-lg">
                <p className="text-gray-500">No hay datos para {institutionId}</p>
              </div>
            )
          }

          return (
            <div key={institutionId} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Institución {institutionId}</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{stats.courses_count}</div>
                  <div className="text-gray-600">Cursos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{stats.students_count}</div>
                  <div className="text-gray-600">Estudiantes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{stats.professors_count}</div>
                  <div className="text-gray-600">Profesores</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}