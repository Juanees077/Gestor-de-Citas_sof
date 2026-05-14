"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatTime,
  getStatusColor,
  getStatusLabel,
  cn,
  DAY_NAMES,
  DAY_NAMES_FULL,
} from "@/lib/utils";
import type { Appointment, Config } from "@/lib/types";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export default function CalendarioPage() {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const weekEnd = addDays(weekStart, 6);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    const startStr = format(weekStart, "yyyy-MM-dd");
    const endStr = format(weekEnd, "yyyy-MM-dd");

    const { data } = await supabase
      .from("appointments")
      .select("*, service:services(*)")
      .gte("appointment_date", startStr)
      .lte("appointment_date", endStr)
      .neq("status", "cancelled")
      .order("start_time");

    setAppointments(data || []);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    supabase.from("config").select("*").single().then(({ data }) => setConfig(data));
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getApptsByDay = (date: Date) =>
    appointments.filter(
      (a) => a.appointment_date === format(date, "yyyy-MM-dd")
    );

  const isWorkingDay = (date: Date) => {
    if (!config) return true;
    return config.working_days.includes(date.getDay());
  };

  // Generate hour slots for display
  const hours: string[] = [];
  if (config) {
    const [startH] = config.start_time.split(":").map(Number);
    const [endH] = config.end_time.split(":").map(Number);
    for (let h = startH; h < endH; h++) {
      hours.push(`${String(h).padStart(2, "0")}:00`);
    }
  } else {
    for (let h = 8; h < 19; h++) {
      hours.push(`${String(h).padStart(2, "0")}:00`);
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-500 mt-1">
            {format(weekStart, "d MMM", { locale: es })} —{" "}
            {format(weekEnd, "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Link href="/admin/citas?new=1" className="btn-primary text-sm py-2">
            <PlusCircle className="w-4 h-4" />
            Nueva cita
          </Link>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-100">
          <div className="p-3 text-xs text-gray-400 border-r border-gray-100" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const working = isWorkingDay(day);
            return (
              <div
                key={i}
                className={cn(
                  "p-3 text-center border-r border-gray-100 last:border-r-0",
                  !working && "bg-gray-50"
                )}
              >
                <p className={cn("text-xs font-medium", isToday ? "text-rose-500" : "text-gray-500")}>
                  {DAY_NAMES[day.getDay()]}
                </p>
                <p
                  className={cn(
                    "text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center mx-auto rounded-full",
                    isToday ? "bg-rose-500 text-white" : "text-gray-800"
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto admin-scroll" style={{ maxHeight: "560px" }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : (
            hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[60px]">
                {/* Hour label */}
                <div className="p-2 text-xs text-gray-400 border-r border-gray-100 flex items-start pt-2.5">
                  {formatTime(hour)}
                </div>
                {/* Day cells */}
                {weekDays.map((day, di) => {
                  const dayAppts = getApptsByDay(day).filter((a) => {
                    const apptHour = a.start_time.substring(0, 2);
                    return apptHour === hour.substring(0, 2);
                  });
                  const working = isWorkingDay(day);

                  return (
                    <div
                      key={di}
                      className={cn(
                        "p-1 border-r border-gray-50 last:border-r-0 min-h-[60px]",
                        !working && "bg-gray-50/50"
                      )}
                    >
                      {dayAppts.map((appt) => (
                        <button
                          key={appt.id}
                          onClick={() => setSelectedAppt(appt)}
                          className="w-full text-left mb-1 p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors group"
                        >
                          <p className="text-xs font-semibold text-rose-800 truncate">
                            {appt.client_name}
                          </p>
                          <p className="text-xs text-rose-600 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTime(appt.start_time)}
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-gray-900">
                Detalle de cita
              </h3>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="font-semibold text-gray-900">{selectedAppt.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-gray-700">{selectedAppt.client_phone}</p>
              </div>
              {selectedAppt.client_email && (
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-gray-700">{selectedAppt.client_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Servicio</p>
                <p className="text-gray-700">
                  {(selectedAppt.service as { name?: string } | undefined)?.name || "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Fecha</p>
                  <p className="text-gray-700 text-sm">{selectedAppt.appointment_date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Hora</p>
                  <p className="text-gray-700 text-sm">
                    {formatTime(selectedAppt.start_time)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado</p>
                <span className={`badge ${getStatusColor(selectedAppt.status)} mt-1`}>
                  {getStatusLabel(selectedAppt.status)}
                </span>
              </div>
              {selectedAppt.notes && (
                <div>
                  <p className="text-xs text-gray-400">Notas</p>
                  <p className="text-gray-600 text-sm">{selectedAppt.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setSelectedAppt(null)}
                className="btn-secondary flex-1 text-sm"
              >
                Cerrar
              </button>
              <Link
                href={`/admin/citas?edit=${selectedAppt.id}`}
                className="btn-primary flex-1 text-sm"
                onClick={() => setSelectedAppt(null)}
              >
                Editar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
