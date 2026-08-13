import type { Appointment, Service, Config } from "./types";
import { formatDate, formatTime } from "./utils";

interface SendReminderParams {
  appointment: Appointment;
  service: Service;
  config: Config;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export async function sendReminderWhatsApp({
  appointment,
  service,
  config,
}: SendReminderParams): Promise<{ success: boolean; error?: string }> {
  if (!appointment.client_phone) {
    return { success: false, error: "El cliente no tiene teléfono registrado" };
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "recordatorio_cita";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "es";

  if (!token || !phoneNumberId) {
    return { success: false, error: "WhatsApp no está configurado" };
  }

  const dateFormatted = formatDate(appointment.appointment_date);
  const timeFormatted = formatTime(appointment.start_time);
  const to = normalizePhone(appointment.client_phone);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLang },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: appointment.client_name },
                  { type: "text", text: service.name },
                  { type: "text", text: dateFormatted },
                  { type: "text", text: timeFormatted },
                  { type: "text", text: config.business_name },
                ],
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
