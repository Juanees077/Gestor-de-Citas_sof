"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Clock,
  Phone,
  ArrowLeft,
  Sparkles,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatDate,
  formatTime,
  formatPrice,
  getStatusLabel,
  getStatusColor,
} from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MisCitasPage() {
  const [phone, setPhone] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError("");
    setSearched(false);

    const { data, error: fetchError } = await supabase
      .from("appointments")
      .select("*, service:services(*)")
      .eq("client_phone", phone.trim())
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (fetchError) {
      setError("Error al buscar citas. Intenta de nuevo.");
    } else {
      setAppointments(data || []);
      setSearched(true);
    }
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    setCancelling(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    }
    setCancelId(null);
    setCancelling(false);
  };

  const upcoming = appointments.filter(
    (a) =>
      a.status !== "cancelled" &&
      a.status !== "completed" &&
      new Date(a.appointment_date + "T23:59:59") >= new Date()
  );

  const past = appointments.filter(
    (a) =>
      a.status === "cancelled" ||
      a.status === "completed" ||
      new Date(a.appointment_date + "T23:59:59") < new Date()
  );

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
            Mis Citas
          </h1>
          <p className="text-gray-500">
            Ingresa tu número de teléfono para ver tus citas
          </p>
        </div>

        {/* Search form */}
        <div className="card p-6 mb-6 animate-slide-up">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                className="input-field pl-10"
                placeholder="+57 300 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {searched && (
          <div className="animate-slide-up">
            {appointments.length === 0 ? (
              <div className="card p-10 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium mb-1">
                  No encontramos citas
                </p>
                <p className="text-sm text-gray-400">
                  No hay citas registradas con ese número.
                </p>
                <Link href="/reservar" className="btn-primary mt-5 inline-flex">
                  Reservar cita
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                      Próximas citas ({upcoming.length})
                    </h2>
                    <div className="space-y-3">
                      {upcoming.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appointment={appt}
                          onCancel={() => setCancelId(appt.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past */}
                {past.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                      Historial ({past.length})
                    </h2>
                    <div className="space-y-3">
                      {past.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appointment={appt}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center mt-4">
            <Link href="/reservar" className="btn-primary">
              <Calendar className="w-4 h-4" />
              Reservar nueva cita
            </Link>
          </div>
        )}
      </main>

      {/* Cancel modal */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">
              ¿Cancelar cita?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Esta acción no se puede deshacer. ¿Estás segura de que quieres cancelar tu cita?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="btn-secondary flex-1"
              >
                No, mantener
              </button>
              <button
                onClick={() => handleCancel(cancelId)}
                disabled={cancelling}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel?: () => void;
}) {
  const service = appointment.service as { name: string; price: number } | undefined;
  const isPast =
    appointment.status === "cancelled" ||
    appointment.status === "completed" ||
    new Date(appointment.appointment_date + "T23:59:59") < new Date();

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-semibold text-gray-900">
            {service?.name || "Servicio"}
          </p>
          {service?.price && (
            <p className="text-sm text-rose-600 font-medium">
              {formatPrice(service.price)}
            </p>
          )}
        </div>
        <span className={`badge ${getStatusColor(appointment.status)}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-400" />
          {formatDate(appointment.appointment_date)}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" />
          {formatTime(appointment.start_time)} — {formatTime(appointment.end_time)}
        </div>
      </div>

      {appointment.notes && (
        <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-lg p-2">
          {appointment.notes}
        </p>
      )}

      {!isPast && onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Cancelar cita
        </button>
      )}
    </div>
  );
}
