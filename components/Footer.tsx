import Link from "next/link";
import Image from "next/image";
import { Instagram, Phone, Mail, MapPin, Heart } from "lucide-react";
import type { Config } from "@/lib/types";

interface FooterProps {
  config?: Partial<Config>;
}

export default function Footer({ config }: FooterProps) {
  const businessName = config?.business_name || "Sofia Martinez";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/logo.jpeg" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <span className="font-display text-white text-lg font-bold">
                {businessName}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {config?.tagline || "Especialista en Belleza"} — Tu belleza, nuestra pasión.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.instagram.com/sofiamartinez_makeup_nails/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-rose-600 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Inicio" },
                { href: "/#servicios", label: "Servicios" },
                { href: "/reservar", label: "Reservar Cita" },
                { href: "/mis-citas", label: "Mis Citas" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <a href="tel:+573177978936" className="hover:text-white transition-colors">
                  +57 317 7978936
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <a href="mailto:sofimari11222004@gmail.com" className="hover:text-white transition-colors">
                  sofimari11222004@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>Cra 33C 44-42 mz 16 Cs14, Líbano 2000, Segundo Piso</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} {businessName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-full transition-colors"
            >
              Panel Admin
            </Link>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-rose-500" /> para ti
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
