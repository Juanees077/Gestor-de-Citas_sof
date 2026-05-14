import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, addMinutes, isBefore, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Config, TimeSlot, Appointment } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy");
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "pm" : "am";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${minutes} ${period}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function generateTimeSlots(
  config: Config,
  date: string,
  existingAppointments: Appointment[],
  serviceDuration: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  if (!config.working_days.includes(dayOfWeek)) return [];

  const baseDate = new Date("2000-01-01");
  let current = parse(config.start_time, "HH:mm:ss", baseDate);
  const endOfDay = parse(config.end_time, "HH:mm:ss", baseDate);

  // Minimum advance time check
  const now = new Date();
  const selectedDate = parseISO(date);
  const minBookingTime = new Date(now.getTime() + config.min_advance_hours * 60 * 60 * 1000);

  while (isBefore(current, endOfDay)) {
    const slotEnd = addMinutes(current, serviceDuration);
    if (isAfter(slotEnd, endOfDay)) break;

    const startStr = format(current, "HH:mm");
    const endStr = format(slotEnd, "HH:mm");

    // Check if slot is in the past or too close to now
    const slotDateTime = new Date(`${date}T${startStr}:00`);
    const isTooSoon = isBefore(slotDateTime, minBookingTime);

    // Check overlap with existing appointments
    const hasConflict = existingAppointments.some((appt) => {
      if (appt.status === "cancelled") return false;
      const apptStart = appt.start_time.substring(0, 5);
      const apptEnd = appt.end_time.substring(0, 5);
      return (
        (startStr >= apptStart && startStr < apptEnd) ||
        (endStr > apptStart && endStr <= apptEnd) ||
        (startStr <= apptStart && endStr >= apptEnd)
      );
    });

    slots.push({
      start: startStr,
      end: endStr,
      available: !isTooSoon && !hasConflict,
    });

    current = addMinutes(current, config.slot_duration);
  }

  return slots;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DAY_NAMES_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
