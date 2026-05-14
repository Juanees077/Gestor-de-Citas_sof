import type { Appointment, Service, Config } from "./types";
import { formatDate, formatTime } from "./utils";

interface SendReminderParams {
  appointment: Appointment;
  service: Service;
  config: Config;
}

export async function sendReminderEmail({
  appointment,
  service,
  config,
}: SendReminderParams): Promise<{ success: boolean; error?: string }> {
  if (!appointment.client_email) {
    return { success: false, error: "El cliente no tiene email registrado" };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, error: "API de email no configurada" };
  }

  const dateFormatted = formatDate(appointment.appointment_date);
  const timeFormatted = formatTime(appointment.start_time);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Cita</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#e11d48,#fb7185);padding:40px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
        ${config.business_name}
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">${config.tagline}</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 8px;">Recordatorio de tu cita</h2>
      <p style="color:#555;font-size:16px;margin:0 0 24px;">
        Hola <strong>${appointment.client_name}</strong>, te recordamos que tienes una cita próxima con nosotras.
      </p>
      <!-- Cita info -->
      <div style="background:#fdf2f4;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid #e11d48;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:14px;width:120px;">Servicio</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:600;">${service.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:14px;">Fecha</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:600;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:14px;">Hora</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:600;">${timeFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:14px;">Duración</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:600;">${service.duration} minutos</td>
          </tr>
        </table>
      </div>
      ${
        config.address
          ? `<p style="color:#555;font-size:14px;margin:0 0 16px;">
            📍 <strong>Dirección:</strong> ${config.address}
          </p>`
          : ""
      }
      ${
        config.phone
          ? `<p style="color:#555;font-size:14px;margin:0 0 16px;">
            📞 <strong>Teléfono:</strong> ${config.phone}
          </p>`
          : ""
      }
      <p style="color:#888;font-size:13px;margin:24px 0 0;">
        Si necesitas cancelar o reprogramar, contáctanos con al menos ${config.min_advance_hours} horas de anticipación.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;color:#aaa;font-size:12px;">
        Este es un mensaje automático de ${config.business_name}
        ${config.instagram ? ` · Instagram: @${config.instagram}` : ""}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${config.business_name} <onboarding@resend.dev>`,
        to: appointment.client_email,
        subject: `Recordatorio: Tu cita el ${dateFormatted} a las ${timeFormatted}`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
