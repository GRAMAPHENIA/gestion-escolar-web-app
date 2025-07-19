-- Row Level Security actualizado para el nuevo esquema
-- Ejecutar después del script anterior

-- Habilitar RLS en todas las tablas
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener el usuario actual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users WHERE id = get_current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para instituciones
CREATE POLICY "Everyone can view institutions" ON institutions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all institutions" ON institutions
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Directors can manage their institution" ON institutions
  FOR ALL USING (
    get_current_user_role() = 'director' AND
    id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
  );

-- Políticas para usuarios
CREATE POLICY "Users can view users from their institution" ON users
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Directors can manage users in their institution" ON users
  FOR ALL USING (
    get_current_user_role() = 'director' AND
    institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
  );

-- Políticas para cursos
CREATE POLICY "Users can view courses from their institution" ON courses
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
  );

CREATE POLICY "Admins and directors can manage courses" ON courses
  FOR ALL USING (
    get_current_user_role() IN ('admin', 'director') AND
    (get_current_user_role() = 'admin' OR 
     institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id()))
  );

-- Políticas para profesores
CREATE POLICY "Users can view professors from their institution" ON professors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = professors.id 
      AND (get_current_user_role() = 'admin' OR 
           u.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id()))
    )
  );

CREATE POLICY "Admins and directors can manage professors" ON professors
  FOR ALL USING (
    get_current_user_role() IN ('admin', 'director') AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = professors.id 
      AND (get_current_user_role() = 'admin' OR 
           u.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id()))
    )
  );

-- Políticas para alumnos
CREATE POLICY "Users can view students from their institution" ON students
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM courses c 
      WHERE c.id = students.course_id 
      AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
    )
  );

CREATE POLICY "Admins, directors and professors can manage students" ON students
  FOR ALL USING (
    get_current_user_role() IN ('admin', 'director', 'profesor') AND
    (get_current_user_role() = 'admin' OR
     EXISTS (
       SELECT 1 FROM courses c 
       WHERE c.id = students.course_id 
       AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
     ))
  );

-- Políticas para materias
CREATE POLICY "Users can view subjects from their institution" ON subjects
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM courses c 
      WHERE c.id = subjects.course_id 
      AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
    )
  );

CREATE POLICY "Admins, directors and professors can manage subjects" ON subjects
  FOR ALL USING (
    get_current_user_role() IN ('admin', 'director', 'profesor') AND
    (get_current_user_role() = 'admin' OR
     EXISTS (
       SELECT 1 FROM courses c 
       WHERE c.id = subjects.course_id 
       AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
     ))
  );

-- Políticas para notas
CREATE POLICY "Users can view grades from their institution" ON grades
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    professor_id = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM students s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = grades.student_id
      AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
    )
  );

CREATE POLICY "Professors can manage grades for their subjects" ON grades
  FOR ALL USING (
    get_current_user_role() = 'admin' OR
    professor_id = get_current_user_id() OR
    (get_current_user_role() = 'director' AND
     EXISTS (
       SELECT 1 FROM students s
       JOIN courses c ON s.course_id = c.id
       WHERE s.id = grades.student_id
       AND c.institution_id = (SELECT institution_id FROM users WHERE id = get_current_user_id())
     ))
  );
