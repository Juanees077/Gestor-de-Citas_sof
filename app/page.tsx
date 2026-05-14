import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Phone,
  Instagram,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/lib/supabase";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Config, Service } from "@/lib/types";

async function getData() {
  const [configRes, servicesRes] = await Promise.all([
    supabase.from("config").select("*").single(),
    supabase.from("services").select("*").eq("active", true).order("sort_order"),
  ]);
  return {
    config: configRes.data as Config | null,
    services: (servicesRes.data as Service[]) || [],
  };
}

export default async function HomePage() {
  const { config, services } = await getData();

  const businessName = config?.business_name || "Sofia Martinez";
  const tagline = config?.tagline || "Especialista en Belleza";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-200 rounded-full opacity-30 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-100 rounded-full opacity-30 blur-3xl" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in pt-20 sm:pt-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full px-4 py-2 mb-6 shadow-soft">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-rose-700">AQUÍ empieza la magia</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-4">
            Hola, soy{" "}
            <span className="text-gradient">{businessName}</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 font-light mb-4">
            {tagline}
          </p>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Reserva tu cita de forma fácil y rápida. Te ofrezco servicios de belleza
            profesionales con amor y dedicación. ✨
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/reservar" className="btn-primary text-base px-8 py-4">
              <Calendar className="w-5 h-5" />
              Reservar mi cita
            </Link>
            <Link href="/#servicios" className="btn-secondary text-base px-8 py-4">
              Ver servicios
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              { value: "500+", label: "Clientes felices" },
              { value: "5★", label: "Calificación" },
              { value: "5+", label: "Años de experiencia" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-rose-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-rose-300 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-float" />
          </div>
        </div>
      </section>

      {/* ===== SERVICIOS ===== */}
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-rose-50 rounded-full px-4 py-1.5 mb-4">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-rose-700">Lo que ofrezco</span>
            </div>
            <h2 className="section-title mb-3">Mis Servicios</h2>
            <p className="section-subtitle">
              Cada servicio está diseñado para hacerte sentir hermosa y especial
            </p>
          </AnimatedSection>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services.map((service, i) => (
                <AnimatedSection key={service.id} animation="fade-up" delay={(i % 4 + 1) as 1|2|3|4}>
                  <div className="card-hover group p-6 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="text-rose-600 font-bold text-lg">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.duration)}
                    </span>
                  </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Servicios próximamente</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/reservar" className="btn-primary">
              Agendar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== POR QUÉ ELEGIRNOS ===== */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="section-title mb-3">¿Por qué elegirnos?</h2>
            <p className="section-subtitle">Tu comodidad y satisfacción son mi prioridad</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8 text-rose-500" />,
                title: "Reservas fáciles",
                desc: "Agenda tu cita en línea en menos de 2 minutos, cuando quieras y desde donde estés.",
              },
              {
                icon: <Star className="w-8 h-8 text-gold-500" />,
                title: "Calidad premium",
                desc: "Uso productos de alta calidad y técnicas actualizadas para garantizar los mejores resultados.",
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-green-500" />,
                title: "Recordatorios automáticos",
                desc: "Recibes un recordatorio por email antes de tu cita para que nunca la olvides.",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} animation="fade-up" delay={(i + 1) as 1|2|3}>
                <div className="card p-8 text-center h-full">
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NOSOTRAS ===== */}
      <section id="nosotras" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <AnimatedSection animation="fade-right">
              <div>
              <div className="inline-flex items-center gap-2 bg-rose-50 rounded-full px-4 py-1.5 mb-6">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium text-rose-700">Sobre mí</span>
              </div>
              <h2 className="section-title mb-6">
                Hola, soy{" "}
                <span className="text-gradient">{businessName}</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Soy una profesional de la belleza apasionada por transformar y
                  realzar la belleza natural de cada persona. Con años de experiencia
                  en el sector, me he especializado en crear looks únicos y
                  personalizados.
                </p>
                <p>
                  Mi misión es que cada cliente salga sintiéndose hermosa, segura
                  y especial. Trabajo con los mejores productos del mercado para
                  garantizar resultados excepcionales.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                {["Colorimetría", "Técnicas modernas", "Atención personalizada", "Productos premium"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-left">
              {/* Visual placeholder - elegant card */}
              <div className="relative">
              <div className="aspect-[3/4] max-w-sm mx-auto rounded-3xl shadow-rose-lg relative overflow-hidden">
                <Image src="/modelo.png" alt={businessName} fill className="object-cover object-top" quality={100} />
              </div>
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clientes satisfechas</p>
                  <p className="font-bold text-gray-900">500+</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-soft p-4 flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="font-bold text-gray-900">5.0</p>
                  <p className="text-xs text-gray-500">Calificación</p>
                </div>
              </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-rose-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Lista para tu transformación?
          </h2>
          <p className="text-rose-100 text-lg mb-8">
            Reserva tu cita ahora y deja que me encargue del resto.
          </p>
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            <Calendar className="w-5 h-5" />
            Reservar cita gratis
          </Link>
        </div>
      </section>

      {/* ===== CONTACTO ===== */}
      <section id="contacto" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-rose-50 rounded-full px-4 py-1.5 mb-4">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-rose-700">Hablemos</span>
            </div>
            <h2 className="section-title mb-3">Contáctame</h2>
            <p className="section-subtitle">Estoy aquí para ayudarte y resolver tus dudas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Info de contacto */}
            <div className="space-y-5">
              <a
                href="tel:+573177978936"
                className="flex items-center gap-4 p-5 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Teléfono / WhatsApp</p>
                  <p className="font-semibold text-gray-900">+57 317 7978936</p>
                </div>
              </a>

              <a
                href="mailto:sofimari11222004@gmail.com"
                className="flex items-center gap-4 p-5 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Correo electrónico</p>
                  <p className="font-semibold text-gray-900">sofimari11222004@gmail.com</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/sofiamartinez_makeup_nails/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors flex-shrink-0">
                  <Instagram className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Instagram</p>
                  <p className="font-semibold text-gray-900">@sofiamartinez_makeup_nails</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-rose-100 bg-rose-50/50">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Dirección</p>
                  <p className="font-semibold text-gray-900">Cra 33C 44-42 mz 16 Cs14</p>
                  <p className="text-sm text-gray-500">Líbano 2000, Segundo Piso</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-3xl overflow-hidden shadow-soft border border-rose-100 h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d500!2d-74.1743126!3d11.2129983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDEyJzQ2LjgiTiA3NMKwMTAnMjcuNSJX!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Sofia Martinez"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer config={config || undefined} />
    </div>
  );
}
