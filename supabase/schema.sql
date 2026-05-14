-- =============================================
-- GESTOR DE CITAS - SOFIA MARTINEZ
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: config (singleton - configuración del negocio)
-- =============================================
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL DEFAULT 'Sofia Martinez',
  tagline TEXT DEFAULT 'Especialista en Belleza',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  -- Días laborales: array de enteros (0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab)
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  start_time TIME DEFAULT '09:00',
  end_time TIME DEFAULT '18:00',
  -- Aviso mínimo en horas antes de reservar
  min_advance_hours INTEGER DEFAULT 24,
  -- Duración predeterminada del slot en minutos
  slot_duration INTEGER DEFAULT 60,
  -- Máximo de citas por día (0 = sin límite)
  max_daily_appointments INTEGER DEFAULT 6,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO config (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- =============================================
-- TABLA: services (servicios ofrecidos)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 60, -- minutos
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios de ejemplo para Sofia Martinez (belleza)
INSERT INTO services (name, description, duration, price, sort_order) VALUES
  ('Corte de Cabello', 'Corte personalizado según la forma de tu rostro y estilo', 60, 25000, 1),
  ('Coloración Completa', 'Aplicación de color en todo el cabello con productos premium', 120, 80000, 2),
  ('Mechas / Balayage', 'Técnica de iluminación natural y degradado', 150, 120000, 3),
  ('Tratamiento Capilar', 'Hidratación profunda y nutrición para el cabello', 60, 45000, 4),
  ('Manicure', 'Arreglo y esmaltado de uñas de manos', 45, 20000, 5),
  ('Pedicure', 'Arreglo y esmaltado de uñas de pies', 60, 25000, 6),
  ('Maquillaje Social', 'Maquillaje para eventos y ocasiones especiales', 75, 60000, 7),
  ('Depilación', 'Depilación con cera en diferentes zonas', 30, 15000, 8)
ON CONFLICT DO NOTHING;

-- =============================================
-- TABLA: appointments (citas)
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  -- Datos del cliente
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT DEFAULT '',
  -- Fecha y hora
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  -- Estado: pending, confirmed, cancelled, completed
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT DEFAULT '',
  -- Recordatorio
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, start_time);

-- =============================================
-- CONSTRAINT: Una sola cita activa por franja horaria
-- Evita solapamientos de citas confirmadas/pendientes
-- =============================================
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE appointment_date = NEW.appointment_date
      AND id != NEW.id
      AND status NOT IN ('cancelled')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Ya existe una cita en ese horario';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_appointment_overlap ON appointments;
CREATE TRIGGER prevent_appointment_overlap
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION check_appointment_overlap();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security) - Seguridad por filas
-- =============================================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Config: solo lectura pública, escritura solo admin autenticado
CREATE POLICY "config_public_read" ON config FOR SELECT USING (true);
CREATE POLICY "config_admin_write" ON config FOR UPDATE USING (auth.role() = 'authenticated');

-- Services: lectura pública, escritura solo admin
CREATE POLICY "services_public_read" ON services FOR SELECT USING (true);
CREATE POLICY "services_admin_insert" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "services_admin_update" ON services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "services_admin_delete" ON services FOR DELETE USING (auth.role() = 'authenticated');

-- Appointments: lectura pública (clientes ven sus citas), escritura controlada
CREATE POLICY "appointments_public_read" ON appointments FOR SELECT USING (true);
CREATE POLICY "appointments_public_insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_admin_update" ON appointments FOR UPDATE USING (true);
CREATE POLICY "appointments_admin_delete" ON appointments FOR DELETE USING (auth.role() = 'authenticated');
