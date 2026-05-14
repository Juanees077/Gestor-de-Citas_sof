export interface Config {
  id: string;
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  working_days: number[];
  start_time: string;
  end_time: string;
  min_advance_hours: number;
  slot_duration: number;
  max_daily_appointments: number;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  service_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface BookingFormData {
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  notes: string;
}
