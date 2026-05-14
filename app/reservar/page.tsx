"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatPrice,
  formatDuration,
  formatDate,
  formatTime,
  generateTimeSlots,
  cn,
  DAY_NAMES,
} from "@/lib/utils";
import type { Config, Service, Appointment, TimeSlot } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

type Step = 1 | 2 | 3 | 4;

export default function ReservarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [config, setConfig] = useState<Config | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const [configRes, servicesRes] = await Promise.all([
        supabase.from("config").select("*").single(),
        supabase.from("services").select("*").eq("active", true).order("sort_order"),
      ]);
      setConfig(configRes.data);
      setServices(servicesRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const loadSlots = useCallback(
    async (date: string, service: Service) => {
      if (!config) return;
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", date)
        .neq("status", "cancelled");
      setAppointments(data || []);
      setSlots(generateTimeSlots(config, date, data || [], service.duration));
    },
    [config]
  );

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadSlots(selectedDate, selectedService);
    }
  }, [selectedDate, selectedService, loadSlots]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isDateAvailable = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    if (!config) return true;
    const dayOfWeek = date.getDay();
    return config.working_days.includes(dayOfWeek);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    if (!form.client_name.trim() || !form.client_phone.trim()) {
      setError("Por favor completa nombre y teléfono.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("appointments").insert({
      service_id: selectedService.id,
      client_name: form.client_name.trim(),
      client_phone: form.client_phone.trim(),
      client_email: form.client_email.trim(),
      appointment_date: selectedDate,
      start_time: selectedSlot.start + ":00",
      end_time: selectedSlot.end + ":00",
      notes: form.notes.trim(),
      status: "confirmed",
    });

    if (insertError) {
      setError("No se pudo reservar la cita. Es posible que el horario ya no esté disponible.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setStep(4);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
            Reservar Cita
          </h1>
          <p className="text-gray-500">Elige tu servicio, fecha y hora preferida</p>
        </div>

        {/* Progress steps */}
        {step < 4 && (
          <div className="flex items-center justify-center mb-10">
            {[
              { n: 1, label: "Servicio" },
              { n: 2, label: "Fecha" },
              { n: 3, label: "Datos" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all",
                      step > s.n
                        ? "bg-rose-500 border-rose-500 text-white"
                        : step === s.n
                        ? "bg-white border-rose-500 text-rose-600"
                        : "bg-white border-gray-200 text-gray-400"
                    )}
                  >
                    {step > s.n ? <CheckCircle className="w-5 h-5" /> : s.n}
                  </div>
                  <span className={cn("text-xs mt-1.5", step >= s.n ? "text-rose-600" : "text-gray-400")}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={cn("h-0.5 w-16 mx-2 mt-[-14px]", step > s.n ? "bg-rose-400" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== STEP 1: Servicio ===== */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">¿Qué servicio deseas?</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group",
                    selectedService?.id === service.id
                      ? "border-rose-400 bg-rose-50"
                      : "border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                        <Sparkles className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-rose-600">{formatPrice(service.price)}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 2: Fecha y hora ===== */}
        {step === 2 && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-600 mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Cambiar servicio
            </button>

            {/* Selected service chip */}
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 mb-6 shadow-card border border-rose-100">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <div>
                <p className="font-semibold text-gray-900">{selectedService?.name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(selectedService?.price || 0)} · {formatDuration(selectedService?.duration || 0)}
                </p>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-700 text-sm capitalize">
                  {format(weekStart, "MMMM yyyy", { locale: es })}
                </span>
                <button
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                    {d}
                  </div>
                ))}
                {weekDays.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const available = isDateAvailable(date);
                  const isSelected = selectedDate === dateStr;
                  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

                  return (
                    <button
                      key={dateStr}
                      disabled={!available}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                        isSelected
                          ? "bg-rose-500 text-white shadow-rose-sm"
                          : available
                          ? "hover:bg-rose-50 text-gray-700 hover:text-rose-600"
                          : "text-gray-300 cursor-not-allowed",
                        isToday && !isSelected && "border-2 border-rose-200"
                      )}
                    >
                      {format(date, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Horarios disponibles — {formatDate(selectedDate)}
                </h3>
                {slots.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No hay horarios disponibles para este día.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.start}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all",
                          selectedSlot?.start === slot.start
                            ? "border-rose-500 bg-rose-500 text-white"
                            : slot.available
                            ? "border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50"
                            : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                        )}
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedDate && selectedSlot && (
              <button
                onClick={() => setStep(3)}
                className="btn-primary w-full mt-5 text-base py-4"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* ===== STEP 3: Datos del cliente ===== */}
        {step === 3 && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-600 mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Cambiar fecha/hora
            </button>

            {/* Resumen */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold text-rose-800 mb-3">Resumen de tu cita</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>{selectedService?.name}</span>
                  <span className="text-rose-600 font-semibold ml-auto">{formatPrice(selectedService?.price || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>{selectedDate ? formatDate(selectedDate) : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>{selectedSlot ? formatTime(selectedSlot.start) : ""}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">Tus datos</h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tu nombre"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+57 300 000 0000"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email{" "}
                    <span className="text-gray-400 font-normal">(para recordatorio)</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="tu@email.com"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notas adicionales{" "}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Alguna preferencia o indicación especial..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full mt-6 text-base py-4"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmar cita
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Confirmación ===== */}
        {step === 4 && (
          <div className="text-center animate-slide-up">
            <div className="card p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                ¡Cita reservada!
              </h2>
              <p className="text-gray-500 mb-8">
                Tu cita ha sido confirmada exitosamente. Te esperamos con mucha emoción.
              </p>

              <div className="bg-rose-50 rounded-2xl p-5 text-left mb-8">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Servicio</span>
                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-semibold text-gray-900">{selectedDate ? formatDate(selectedDate) : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hora</span>
                    <span className="font-semibold text-gray-900">{selectedSlot ? formatTime(selectedSlot.start) : ""}</span>
                  </div>
                  <div className="flex justify-between border-t border-rose-200 pt-3">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-rose-600 text-base">{formatPrice(selectedService?.price || 0)}</span>
                  </div>
                </div>
              </div>

              {form.client_email && (
                <p className="text-sm text-gray-400 mb-6">
                  Recibirás un recordatorio en{" "}
                  <span className="text-gray-600 font-medium">{form.client_email}</span>
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="btn-secondary flex-1">
                  Volver al inicio
                </Link>
                <Link href="/mis-citas" className="btn-primary flex-1">
                  Ver mis citas
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer config={config || undefined} />
    </div>
  );
}
