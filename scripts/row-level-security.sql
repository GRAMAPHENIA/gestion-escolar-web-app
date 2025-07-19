-- Configuración de Row Level Security (RLS) para Supabase
-- Ejecutar después del script anterior

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Políticas para instituciones (solo admins y directores pueden crear/editar)
CREATE POLICY "Everyone can view institutions" ON institutions
  FOR SELECT USING (true);

CREATE POLICY "Admins and directors can manage institutions" ON institutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

-- Políticas para cursos
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Admins and directors can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

-- Políticas para profesores
CREATE POLICY "Everyone can view teachers" ON teachers
  FOR SELECT USING (true);

CREATE POLICY "Admins and directors can manage teachers" ON teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

-- Políticas para alumnos
CREATE POLICY "Everyone can view students" ON students
  FOR SELECT USING (true);

CREATE POLICY "Admins, directors and teachers can manage students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director', 'profesor')
    )
  );

-- Políticas para materias
CREATE POLICY "Everyone can view subjects" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN teachers t ON u.id = t.user_id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
      AND t.id = teacher_id
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

-- Políticas para notas
CREATE POLICY "Students and teachers can view grades" ON grades
  FOR SELECT USING (
    -- El profesor puede ver las notas de sus materias
    EXISTS (
      SELECT 1 FROM users u
      JOIN teachers t ON u.id = t.user_id
      JOIN subjects s ON t.id = s.teacher_id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
      AND s.id = subject_id
    )
    OR
    -- Admins y directores pueden ver todas
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Teachers can manage grades for their subjects" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN teachers t ON u.id = t.user_id
      JOIN subjects s ON t.id = s.teacher_id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
      AND s.id = subject_id
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );

-- Políticas para observaciones
CREATE POLICY "Everyone can view observations" ON observations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create observations" ON observations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Authors can update their observations" ON observations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND id = author_id
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'director')
    )
  );
