# Institution Statistics API Documentation

## Overview

This document describes the API endpoints for retrieving institution statistics and metrics.

## Endpoints

### GET /api/institutions/[id]/stats

Retrieves comprehensive statistics and metrics for a specific institution.

#### Parameters

- `id` (string, required): UUID of the institution

#### Response

```json
{
  "institution": {
    "id": "uuid",
    "name": "Institution Name"
  },
  "statistics": {
    "courses_count": 5,
    "students_count": 120,
    "professors_count": 8,
    "subjects_count": 15,
    "grades_count": 450,
    "average_grade": 8.5,
    "last_updated": "2025-01-20T10:30:00Z"
  },
  "course_distribution": [
    {
      "course_id": "uuid",
      "course_name": "Course Name",
      "students_count": 25
    }
  ],
  "recent_activity": [
    {
      "id": "uuid",
      "type": "grade_added",
      "description": "Nueva nota 9 para Juan Pérez en Matemáticas",
      "grade": 9,
      "observation": "Excelente trabajo",
      "student_name": "Juan Pérez",
      "subject_name": "Matemáticas",
      "professor_name": "Prof. García",
      "date": "2025-01-20",
      "created_at": "2025-01-20T10:30:00Z"
    }
  ],
  "monthly_trends": [
    {
      "month": "2024-12",
      "average_grade": 8.2,
      "grades_count": 45
    }
  ]
}
```

#### Error Responses

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid institution ID format
- `404 Not Found`: Institution not found
- `500 Internal Server Error`: Server error

### GET /api/institutions/[id] (Enhanced)

The existing institution detail endpoint has been enhanced to include basic statistics.

#### Additional Response Fields

```json
{
  "id": "uuid",
  "name": "Institution Name",
  "address": "Address",
  "phone": "Phone",
  "email": "email@example.com",
  "created_at": "2025-01-01T00:00:00Z",
  "courses_count": 5,
  "students_count": 120,
  "professors_count": 8,
  "subjects_count": 15,
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "description": "Course Description",
      "year": 2025,
      "students_count": 25
    }
  ]
}
```

## Implementation Details

### Complex Statistics Query

The statistics are calculated using optimized queries that:

1. Count courses directly associated with the institution
2. Count students enrolled in courses of the institution
3. Count professors assigned to the institution
4. Count subjects across all courses
5. Calculate average grades from all students in the institution
6. Retrieve recent activity (last 30 days)
7. Generate monthly trends (last 6 months)

### Performance Considerations

- Queries are optimized to minimize database calls
- Statistics are calculated on-demand (no caching yet)
- Large datasets are limited (20 recent activities, 6 months of trends)
- Proper indexing is assumed on foreign key relationships

### Security

- All endpoints require authentication via Clerk
- UUID validation for institution IDs
- Proper error handling and logging

## Usage Examples

### Fetch Institution Statistics

```javascript
const response = await fetch('/api/institutions/123e4567-e89b-12d3-a456-426614174000/stats', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})

const data = await response.json()
console.log(`Institution has ${data.statistics.students_count} students`)
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/institutions/invalid-id/stats')
  if (!response.ok) {
    const error = await response.json()
    console.error('API Error:', error.error)
  }
} catch (error) {
  console.error('Network Error:', error.message)
}
```

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 4.2**: Institution dashboard metrics with courses, students, and professors count
- **Requirement 4.6**: Recent activity timeline showing grade additions and other activities

The complex queries provide comprehensive statistics while maintaining good performance through optimized database access patterns.