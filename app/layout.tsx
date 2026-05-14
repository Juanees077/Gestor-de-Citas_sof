import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sofia Martinez | Especialista en Belleza",
  description:
    "Reserva tu cita con Sofia Martinez. Servicios de belleza profesionales: cortes, coloración, maquillaje, manicure y más.",
  keywords: "belleza, peluquería, manicure, maquillaje, Sofia Martinez, citas",
  openGraph: {
    title: "Sofia Martinez | Especialista en Belleza",
    description: "Reserva tu cita de belleza en línea",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-cream-100">{children}</body>
    </html>
  );
}
