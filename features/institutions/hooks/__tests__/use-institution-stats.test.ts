/**
 * Tests for useInstitutionStats hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useInstitutionStats, useMultipleInstitutionStats, clearInstitutionStatsCache } from '../use-institution-stats'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('useInstitutionStats', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    clearInstitutionStatsCache()
  })

  it('should fetch stats successfully', async () => {
    const mockStats = {
      courses_count: 5,
      students_count: 100,
      professors_count: 10,
      recent_activity: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockStats
      })
    } as Response)

    const { result } = renderHook(() => useInstitutionStats())

    await act(async () => {
      await result.current.fetchStats('test-id')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.stats).toEqual(mockStats)
      expect(result.current.error).toBeNull()
    })
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Institution not found'
      })
    } as Response)

    const { result } = renderHook(() => useInstitutionStats())

    await act(async () => {
      await result.current.fetchStats('invalid-id')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Institution not found')
      expect(result.current.stats).toBeNull()
    })
  })

  it('should use cache when available', async () => {
    const mockStats = {
      courses_count: 5,
      students_count: 100,
      professors_count: 10,
      recent_activity: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockStats
      })
    } as Response)

    const { result } = renderHook(() => useInstitutionStats())

    // First call should fetch from API
    await act(async () => {
      await result.current.fetchStats('test-id')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Second call should use cache
    await act(async () => {
      await result.current.fetchStats('test-id')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1) // Still only 1 call
    expect(result.current.stats).toEqual(mockStats)
  })

  it('should force refresh when requested', async () => {
    const mockStats = {
      courses_count: 5,
      students_count: 100,
      professors_count: 10,
      recent_activity: []
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockStats
      })
    } as Response)

    const { result } = renderHook(() => useInstitutionStats())

    // First call
    await act(async () => {
      await result.current.fetchStats('test-id')
    })

    // Force refresh should make another API call
    await act(async () => {
      await result.current.fetchStats('test-id', true)
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('useMultipleInstitutionStats', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    clearInstitutionStatsCache()
  })

  it('should fetch multiple institution stats', async () => {
    const mockStatsMap = {
      'id1': {
        courses_count: 5,
        students_count: 100,
        professors_count: 10,
        recent_activity: []
      },
      'id2': {
        courses_count: 3,
        students_count: 50,
        professors_count: 5,
        recent_activity: []
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockStatsMap
      })
    } as Response)

    const { result } = renderHook(() => 
      useMultipleInstitutionStats(['id1', 'id2'])
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.statsMap).toEqual(mockStatsMap)
      expect(result.current.error).toBeNull()
    })
  })

  it('should handle empty institution list', async () => {
    const { result } = renderHook(() => 
      useMultipleInstitutionStats([])
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.statsMap).toEqual({})
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})