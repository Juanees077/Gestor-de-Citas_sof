"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  PlusCircle,
  Search,
  Filter,
  Bell,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatDate,
  formatTime,
  formatPrice,
  getStatusColor,
  getStatusLabel,
  generateTimeSlots,
  cn,
} from "@/lib/utils";
import type { Appointment, Service, Config, AppointmentStatus } from "@/lib/types";
import { format, addDays, startOfWeek } from "date-fns";

const STATUS_OPTIONS: AppointmentStatus[] = ["confirmed", "pending", "completed", "cancelled"];

export default function CitasPage() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reminderMsg, setReminderMsg] = useState<{ id: string; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<{ start: string; end: string; available: boolean }[]>([]);

  const [form, setForm] = useState({
    service_id: "",
    client_name: "",
    client_phone: "",
    client_email: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "",
    status: "confirmed" as AppointmentStatus,
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [apptRes, servRes, confRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, service:services(*)")
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(200),
      supabase.from("services").select("*").eq("active", true).order("sort_order"),
      supabase.from("config").select("*").single(),
    ]);
    setAppointments(apptRes.data || []);
    setServices(servRes.data || []);
    setConfig(confRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openNewForm();
    } else if (searchParams.get("edit")) {
      const id = searchParams.get("edit");
      const appt = appointments.find((a) => a.id === id);
      if (appt) openEditForm(appt);
    }
  }, [searchParams, appointments]);

  useEffect(() => {
    if (form.appointment_date && form.service_id && config) {
      const service = services.find((s) => s.id === form.service_id);
      if (!service) return;
      supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", form.appointment_date)
        .neq("status", "cancelled")
        .then(({ data }) => {
          const existing = (data || []).filter((a) =>
            editingAppt ? a.id !== editingAppt.id : true
          );
          setSlots(generateTimeSlots(config, form.appointment_date, existing as Appointment[], service.duration));
        });
    }
  }, [form.appointment_date, form.service_id, config, services, editingAppt]);

  const openNewForm = () => {
    setEditingAppt(null);
    setForm({
      service_id: services[0]?.id || "",
      client_name: "",
      client_phone: "",
      client_email: "",
      appointment_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "",
      status: "confirmed",
      notes: "",
    });
    setShowForm(true);
  };

  const openEditForm = (appt: Appointment) => {
    setEditingAppt(appt);
    setForm({
      service_id: appt.service_id || "",
      client_name: appt.client_name,
      client_phone: appt.client_phone,
      client_email: appt.client_email,
      appointment_date: appt.appointment_date,
      start_time: appt.start_time.substring(0, 5),
      status: appt.status,
      notes: appt.notes,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.client_name || !form.client_phone || !form.start_time || !form.service_id) return;
    setSaving(true);

    const service = services.find((s) => s.id === form.service_id);
    if (!service) { setSaving(false); return; }

    const slot = slots.find((s) => s.start === form.start_time);
    const endTime = slot ? slot.end + ":00" : form.start_time + ":00";

    const payload = {
      service_id: form.service_id,
      client_name: form.client_name.trim(),
      client_phone: form.client_phone.trim(),
      client_email: form.client_email.trim(),
      appointment_date: form.appointment_date,
      start_time: form.start_time + ":00",
      end_time: endTime,
      status: form.status,
      notes: form.notes.trim(),
    };

    if (editingAppt) {
      await supabase.from("appointments").update(payload).eq("id", editingAppt.id);
    } else {
      await supabase.from("appointments").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setDeleteId(null);
    loadData();
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleSendReminder = async (appt: Appointment) => {
    const res = await fetch("/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: appt.id }),
    });
    const data = await res.json();
    setReminderMsg({
      id: appt.id,
      msg: data.success ? "Recordatorio enviado con éxito." : `Error: ${data.error}`,
    });
    setTimeout(() => setReminderMsg(null), 4000);
  };

  // Filter appointments
  const filtered = appointments.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.client_phone.includes(searchTerm);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchDate = !filterDate || a.appointment_date === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-500 mt-1">{filtered.length} resultado(s)</p>
        </div>
        <button onClick={openNewForm} className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10 py-2.5 text-sm"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field py-2.5 text-sm w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-field py-2.5 text-sm w-auto"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {(filterStatus !== "all" || filterDate || searchTerm) && (
          <button
            onClick={() => { setFilterStatus("all"); setFilterDate(""); setSearchTerm(""); }}
            className="text-sm text-rose-500 hover:text-rose-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin citas</p>
            <p className="text-sm mt-1">No hay citas que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Cliente", "Servicio", "Fecha", "Hora", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900 text-sm">{appt.client_name}</p>
                      <p className="text-xs text-gray-400">{appt.client_phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-700">
                        {(appt.service as { name?: string } | undefined)?.name || "—"}
                      </p>
                      <p className="text-xs text-rose-500">
                        {formatPrice((appt.service as { price?: number } | undefined)?.price || 0)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {formatDate(appt.appointment_date)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {formatTime(appt.start_time)}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full border cursor-pointer",
                          getStatusColor(appt.status)
                        )}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{getStatusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {appt.client_email && (
                          <button
                            onClick={() => handleSendReminder(appt)}
                            title="Enviar recordatorio"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditForm(appt)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(appt.id)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {reminderMsg?.id === appt.id && (
                        <p className="text-xs text-green-600 mt-1">{reminderMsg.msg}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== FORM MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-4 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-gray-900">
                {editingAppt ? "Editar cita" : "Nueva cita"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              {/* Service */}
              <div>
                <label className="label">Servicio *</label>
                <select
                  className="input-field"
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Client name */}
              <div>
                <label className="label"><User className="w-3.5 h-3.5 inline mr-1" />Nombre *</label>
                <input type="text" className="input-field" value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label"><Phone className="w-3.5 h-3.5 inline mr-1" />Teléfono *</label>
                  <input type="tel" className="input-field" value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
                </div>
                <div>
                  <label className="label"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
                  <input type="email" className="input-field" value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="label"><Calendar className="w-3.5 h-3.5 inline mr-1" />Fecha *</label>
                <input type="date" className="input-field" value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value, start_time: "" })} />
              </div>

              {/* Time slots */}
              {form.appointment_date && form.service_id && (
                <div>
                  <label className="label"><Clock className="w-3.5 h-3.5 inline mr-1" />Hora *</label>
                  {slots.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No hay horarios disponibles ese día.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setForm({ ...form, start_time: slot.start })}
                          className={cn(
                            "py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all",
                            form.start_time === slot.start
                              ? "border-rose-500 bg-rose-500 text-white"
                              : slot.available
                              ? "border-gray-200 text-gray-700 hover:border-rose-300"
                              : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                          )}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="label">Estado</label>
                <select className="input-field" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="label"><FileText className="w-3.5 h-3.5 inline mr-1" />Notas</label>
                <textarea className="input-field resize-none" rows={2} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.client_name || !form.client_phone || !form.start_time}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> {editingAppt ? "Guardar" : "Crear cita"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">¿Eliminar cita?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
