"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatDate,
  formatTime,
  getStatusLabel,
  getStatusColor,
  formatPrice,
} from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("appointments")
        .select("*, service:services(*)")
        .gte("appointment_date", today)
        .order("appointment_date")
        .order("start_time")
        .limit(50);
      setAppointments(data || []);
      setLoading(false);
    }
    load();
  }, [today]);

  const todayAppts = appointments.filter((a) => a.appointment_date === today && a.status !== "cancelled");
  const upcomingAppts = appointments.filter(
    (a) => a.appointment_date > today && a.status !== "cancelled"
  );
  const confirmedToday = todayAppts.filter((a) => a.status === "confirmed").length;
  const revenueToday = todayAppts.reduce((sum, a) => {
    const price = (a.service as { price?: number } | undefined)?.price || 0;
    return sum + price;
  }, 0);

  const stats = [
    {
      label: "Citas hoy",
      value: todayAppts.length,
      icon: <Calendar className="w-6 h-6 text-rose-500" />,
      bg: "bg-rose-50",
      trend: `${confirmedToday} confirmadas`,
    },
    {
      label: "Próximas",
      value: upcomingAppts.length,
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-50",
      trend: "en los próximos días",
    },
    {
      label: "Ingresos hoy",
      value: formatPrice(revenueToday),
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      bg: "bg-green-50",
      trend: "estimado",
    },
    {
      label: "Total semana",
      value: appointments.filter((a) => a.status !== "cancelled").length,
      icon: <Users className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-50",
      trend: "citas activas",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Link href="/admin/citas?new=1" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Citas de hoy</h2>
            <Link href="/admin/citas" className="text-sm text-rose-500 hover:text-rose-700 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto admin-scroll">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay citas para hoy</p>
              </div>
            ) : (
              todayAppts.map((appt) => (
                <AppointmentRow key={appt.id} appointment={appt} />
              ))
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Próximas citas</h2>
            <Link href="/admin/calendario" className="text-sm text-rose-500 hover:text-rose-700 flex items-center gap-1">
              Calendario <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto admin-scroll">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : upcomingAppts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin citas próximas</p>
              </div>
            ) : (
              upcomingAppts.slice(0, 8).map((appt) => (
                <AppointmentRow key={appt.id} appointment={appt} showDate />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  showDate = false,
}: {
  appointment: Appointment;
  showDate?: boolean;
}) {
  const service = appointment.service as { name?: string } | undefined;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate text-sm">
          {appointment.client_name}
        </p>
        <p className="text-xs text-gray-400 truncate">{service?.name || "Servicio"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {showDate && (
          <p className="text-xs text-gray-500">{formatDate(appointment.appointment_date)}</p>
        )}
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1 justify-end">
          <Clock className="w-3 h-3 text-gray-400" />
          {formatTime(appointment.start_time)}
        </p>
      </div>
      <span className={`badge text-xs ${getStatusColor(appointment.status)} ml-2`}>
        {getStatusLabel(appointment.status)}
      </span>
    </div>
  );
}
