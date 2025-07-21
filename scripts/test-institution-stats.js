/**
 * Script para validar los endpoints de estadísticas de instituciones
 * Este script verifica que los endpoints respondan correctamente
 */

const BASE_URL = 'http://localhost:3000'

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return {
      status: response.status,
      data,
      ok: response.ok
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    }
  }
}

// Test de endpoints
async function testEndpoints() {
  console.log('🧪 Iniciando tests de endpoints de instituciones...\n')
  
  // Test 1: GET /api/institutions
  console.log('1. Testing GET /api/institutions')
  const institutionsResponse = await makeRequest(`${BASE_URL}/api/institutions`)
  console.log(`   Status: ${institutionsResponse.status}`)
  console.log(`   Success: ${institutionsResponse.ok}`)
  if (institutionsResponse.data) {
    console.log(`   Response keys: ${Object.keys(institutionsResponse.data).join(', ')}`)
  }
  console.log()
  
  // Si hay instituciones, probar endpoints específicos
  if (institutionsResponse.ok && institutionsResponse.data.institutions?.length > 0) {
    const firstInstitution = institutionsResponse.data.institutions[0]
    const institutionId = firstInstitution.id
    
    // Test 2: GET /api/institutions/[id]
    console.log(`2. Testing GET /api/institutions/${institutionId}`)
    const institutionResponse = await makeRequest(`${BASE_URL}/api/institutions/${institutionId}`)
    console.log(`   Status: ${institutionResponse.status}`)
    console.log(`   Success: ${institutionResponse.ok}`)
    if (institutionResponse.data) {
      console.log(`   Institution name: ${institutionResponse.data.name}`)
      console.log(`   Courses count: ${institutionResponse.data.courses_count}`)
      console.log(`   Students count: ${institutionResponse.data.students_count}`)
      console.log(`   Professors count: ${institutionResponse.data.professors_count}`)
    }
    console.log()
    
    // Test 3: GET /api/institutions/[id]/stats
    console.log(`3. Testing GET /api/institutions/${institutionId}/stats`)
    const statsResponse = await makeRequest(`${BASE_URL}/api/institutions/${institutionId}/stats`)
    console.log(`   Status: ${statsResponse.status}`)
    console.log(`   Success: ${statsResponse.ok}`)
    if (statsResponse.data) {
      console.log(`   Statistics keys: ${Object.keys(statsResponse.data).join(', ')}`)
      if (statsResponse.data.statistics) {
        console.log(`   Stats: ${JSON.stringify(statsResponse.data.statistics, null, 2)}`)
      }
      if (statsResponse.data.recent_activity) {
        console.log(`   Recent activity count: ${statsResponse.data.recent_activity.length}`)
      }
      if (statsResponse.data.monthly_trends) {
        console.log(`   Monthly trends count: ${statsResponse.data.monthly_trends.length}`)
      }
    }
    console.log()
  } else {
    console.log('⚠️  No hay instituciones para probar endpoints específicos')
    console.log()
  }
  
  console.log('✅ Tests completados')
}

// Ejecutar tests si se llama directamente
if (typeof window === 'undefined') {
  testEndpoints().catch(console.error)
}

module.exports = { testEndpoints, makeRequest }