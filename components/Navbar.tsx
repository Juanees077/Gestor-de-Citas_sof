"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/#servicios", label: "Servicios" },
    { href: "/#nosotras", label: "Nosotras" },
    { href: "/#contacto", label: "Contacto" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-soft border-b border-rose-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-rose-sm">
              <Image src="/logo.jpeg" alt="Logo Sofia Martinez" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 group-hover:text-rose-600 transition-colors">
              Sofia Martinez
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === l.href
                    ? "text-rose-600 bg-rose-50"
                    : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA button */}
          <div className="hidden md:block">
            <Link href="/reservar" className="btn-primary text-sm py-2.5">
              Reservar Cita
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-gray-700 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/reservar"
                onClick={() => setOpen(false)}
                className="btn-primary w-full text-sm"
              >
                Reservar Cita
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
