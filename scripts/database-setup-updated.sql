-- Esquema actualizado basado en tus especificaciones
-- Ejecutar en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de instituciones
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (enlazada con Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- mismo que el user.id de Clerk
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'profesor')),
  institution_id UUID REFERENCES institutions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  year INT,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de profesores (extiende users)
CREATE TABLE professors (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alumnos
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE,
  birth_date DATE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de materias
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notas
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professors(id) ON DELETE SET NULL,
  grade NUMERIC(5,2),
  observation TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_courses_institution ON courses(institution_id);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_subjects_course ON subjects(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_professor ON grades(professor_id);

-- Datos de ejemplo para testing
INSERT INTO institutions (name, address, phone, email) VALUES
('Colegio San Martín', 'Av. San Martín 1234, Buenos Aires', '+54 11 4567-8900', 'info@colegiosanmartin.edu.ar'),
('Instituto Belgrano', 'Belgrano 567, Córdoba', '+54 351 123-4567', 'contacto@institutobelgrano.edu.ar'),
('Escuela Primaria N°15', 'Mitre 890, Rosario', '+54 341 987-6543', 'escuela15@rosario.edu.ar');
