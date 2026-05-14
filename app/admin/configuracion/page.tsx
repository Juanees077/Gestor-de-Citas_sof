"use client";

import { useState, useEffect } from "react";
import {
  Save,
  PlusCircle,
  Trash2,
  Pencil,
  CheckCircle,
  Building,
  Clock,
  Scissors,
  Globe,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn, DAY_NAMES_FULL } from "@/lib/utils";
import type { Config, Service } from "@/lib/types";

type Tab = "negocio" | "horarios" | "servicios";

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>("negocio");
  const [config, setConfig] = useState<Config | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    active: true,
  });

  useEffect(() => {
    async function load() {
      const [confRes, servRes] = await Promise.all([
        supabase.from("config").select("*").single(),
        supabase.from("services").select("*").order("sort_order"),
      ]);
      setConfig(confRes.data);
      setServices(servRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleConfigSave = async () => {
    if (!config) return;
    setSaving(true);
    await supabase.from("config").update(config).eq("id", config.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleWorkingDay = (day: number) => {
    if (!config) return;
    const days = config.working_days.includes(day)
      ? config.working_days.filter((d) => d !== day)
      : [...config.working_days, day].sort();
    setConfig({ ...config, working_days: days });
  };

  const openNewService = () => {
    setEditService(null);
    setServiceForm({ name: "", description: "", duration: 60, price: 0, active: true });
    setShowServiceForm(true);
  };

  const openEditService = (service: Service) => {
    setEditService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      active: service.active,
    });
    setShowServiceForm(true);
  };

  const handleServiceSave = async () => {
    setSaving(true);
    if (editService) {
      await supabase.from("services").update(serviceForm).eq("id", editService.id);
      setServices((prev) => prev.map((s) => s.id === editService.id ? { ...s, ...serviceForm } : s));
    } else {
      const { data } = await supabase.from("services").insert({
        ...serviceForm,
        sort_order: services.length + 1,
      }).select().single();
      if (data) setServices((prev) => [...prev, data]);
    }
    setSaving(false);
    setShowServiceForm(false);
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "negocio", label: "Negocio", icon: <Building className="w-4 h-4" /> },
    { id: "horarios", label: "Horarios", icon: <Clock className="w-4 h-4" /> },
    { id: "servicios", label: "Servicios", icon: <Scissors className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona los datos de tu negocio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-white text-rose-600 shadow-card"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: NEGOCIO ===== */}
      {tab === "negocio" && config && (
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nombre del negocio</label>
              <input type="text" className="input-field"
                value={config.business_name}
                onChange={(e) => setConfig({ ...config, business_name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Eslogan / Especialidad</label>
              <input type="text" className="input-field"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="tel" className="input-field"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input type="email" className="input-field"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Dirección</label>
              <input type="text" className="input-field"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })} />
            </div>
            <div>
              <label className="label">Instagram (@usuario)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input type="text" className="input-field pl-7"
                  value={config.instagram}
                  onChange={(e) => setConfig({ ...config, instagram: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Facebook</label>
              <input type="text" className="input-field"
                value={config.facebook}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })} />
            </div>
          </div>
          <SaveButton saving={saving} saved={saved} onClick={handleConfigSave} />
        </div>
      )}

      {/* ===== TAB: HORARIOS ===== */}
      {tab === "horarios" && config && (
        <div className="card p-6 space-y-6">
          {/* Working days */}
          <div>
            <label className="label text-base mb-3">Días laborales</label>
            <div className="flex flex-wrap gap-2">
              {DAY_NAMES_FULL.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleWorkingDay(i)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                    config.working_days.includes(i)
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"
                  )}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora de inicio</label>
              <input type="time" className="input-field"
                value={config.start_time.substring(0, 5)}
                onChange={(e) => setConfig({ ...config, start_time: e.target.value + ":00" })} />
            </div>
            <div>
              <label className="label">Hora de cierre</label>
              <input type="time" className="input-field"
                value={config.end_time.substring(0, 5)}
                onChange={(e) => setConfig({ ...config, end_time: e.target.value + ":00" })} />
            </div>
          </div>

          {/* Slot duration */}
          <div>
            <label className="label">Duración del intervalo entre slots (minutos)</label>
            <select className="input-field"
              value={config.slot_duration}
              onChange={(e) => setConfig({ ...config, slot_duration: Number(e.target.value) })}>
              {[15, 30, 45, 60, 90, 120].map((v) => (
                <option key={v} value={v}>{v} minutos</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Cada cuántos minutos aparece un nuevo horario disponible.</p>
          </div>

          {/* Min advance */}
          <div>
            <label className="label">Aviso mínimo para reservar (horas)</label>
            <input type="number" className="input-field" min={0} max={168}
              value={config.min_advance_hours}
              onChange={(e) => setConfig({ ...config, min_advance_hours: Number(e.target.value) })} />
            <p className="text-xs text-gray-400 mt-1">Con cuántas horas de anticipación mínima puede reservar un cliente.</p>
          </div>

          {/* Max daily */}
          <div>
            <label className="label">Máximo de citas por día (0 = sin límite)</label>
            <input type="number" className="input-field" min={0}
              value={config.max_daily_appointments}
              onChange={(e) => setConfig({ ...config, max_daily_appointments: Number(e.target.value) })} />
          </div>

          <SaveButton saving={saving} saved={saved} onClick={handleConfigSave} />
        </div>
      )}

      {/* ===== TAB: SERVICIOS ===== */}
      {tab === "servicios" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewService} className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Nuevo servicio
            </button>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    {!service.active && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-500 truncate">{service.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {service.duration} min · ${service.price.toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditService(service)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service form modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-gray-900">
                {editService ? "Editar servicio" : "Nuevo servicio"}
              </h3>
              <button onClick={() => setShowServiceForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" className="input-field" value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input-field resize-none" rows={2} value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duración (min) *</label>
                  <input type="number" className="input-field" min={15} step={15} value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Precio (COP) *</label>
                  <input type="number" className="input-field" min={0} value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={serviceForm.active}
                  onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                  className="w-4 h-4 accent-rose-500" />
                <label htmlFor="active" className="text-sm text-gray-700">Servicio activo (visible para clientes)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowServiceForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleServiceSave}
                disabled={saving || !serviceForm.name}
                className="btn-primary flex-1"
              >
                {saving ? "Guardando..." : <><CheckCircle className="w-4 h-4" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button onClick={onClick} disabled={saving} className="btn-primary">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
        ) : saved ? (
          <><CheckCircle className="w-4 h-4" /> ¡Guardado!</>
        ) : (
          <><Save className="w-4 h-4" /> Guardar cambios</>
        )}
      </button>
      {saved && (
        <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
          <CheckCircle className="w-4 h-4" /> Los cambios se guardaron correctamente.
        </p>
      )}
    </div>
  );
}
