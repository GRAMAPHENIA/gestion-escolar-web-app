-- Funciones SQL para el dashboard
-- Ejecutar en Supabase SQL Editor

-- Función para obtener promedios de estudiantes
CREATE OR REPLACE FUNCTION get_student_averages()
RETURNS TABLE (
  student_name TEXT,
  course_name TEXT,
  average NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.full_name as student_name,
    c.name as course_name,
    ROUND(AVG(g.grade), 2) as average
  FROM students s
  JOIN courses c ON s.course_id = c.id
  JOIN grades g ON s.id = g.student_id
  WHERE g.grade IS NOT NULL
  GROUP BY s.id, s.full_name, c.name
  HAVING AVG(g.grade) >= 7
  ORDER BY average DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estudiantes con bajo rendimiento
CREATE OR REPLACE FUNCTION get_low_performers()
RETURNS TABLE (
  student_name TEXT,
  course_name TEXT,
  average NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.full_name as student_name,
    c.name as course_name,
    ROUND(AVG(g.grade), 2) as average
  FROM students s
  JOIN courses c ON s.course_id = c.id
  JOIN grades g ON s.id = g.student_id
  WHERE g.grade IS NOT NULL
  GROUP BY s.id, s.full_name, c.name
  HAVING AVG(g.grade) < 6
  ORDER BY average ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas por curso
CREATE OR REPLACE FUNCTION get_course_statistics()
RETURNS TABLE (
  course_id UUID,
  course_name TEXT,
  institution_name TEXT,
  student_count BIGINT,
  average_grade NUMERIC,
  total_grades BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as course_id,
    c.name as course_name,
    i.name as institution_name,
    COUNT(DISTINCT s.id) as student_count,
    ROUND(AVG(g.grade), 2) as average_grade,
    COUNT(g.id) as total_grades
  FROM courses c
  JOIN institutions i ON c.institution_id = i.id
  LEFT JOIN students s ON c.id = s.course_id
  LEFT JOIN grades g ON s.id = g.student_id AND g.grade IS NOT NULL
  GROUP BY c.id, c.name, i.name
  ORDER BY average_grade DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tendencias mensuales
CREATE OR REPLACE FUNCTION get_monthly_grade_trends()
RETURNS TABLE (
  month_year TEXT,
  average_grade NUMERIC,
  total_grades BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(g.date, 'YYYY-MM') as month_year,
    ROUND(AVG(g.grade), 2) as average_grade,
    COUNT(g.id) as total_grades
  FROM grades g
  WHERE g.grade IS NOT NULL
    AND g.date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY TO_CHAR(g.date, 'YYYY-MM')
  ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql;
