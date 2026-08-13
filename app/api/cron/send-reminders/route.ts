import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendReminderWhatsApp } from "@/lib/whatsapp";
import type { Appointment, Service, Config } from "@/lib/types";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const [apptRes, configRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, service:services(*)")
      .eq("appointment_date", tomorrowStr)
      .eq("status", "confirmed")
      .eq("reminder_sent", false),
    supabase.from("config").select("*").single(),
  ]);

  if (apptRes.error) {
    return NextResponse.json({ success: false, error: apptRes.error.message }, { status: 500 });
  }

  const appointments = (apptRes.data || []) as (Appointment & { service: Service })[];
  const config = configRes.data as Config;

  const results = [];
  for (const appointment of appointments) {
    const result = await sendReminderWhatsApp({
      appointment,
      service: appointment.service,
      config,
    });

    if (result.success) {
      await supabase
        .from("appointments")
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq("id", appointment.id);
    }

    results.push({ id: appointment.id, client_phone: appointment.client_phone, ...result });
  }

  return NextResponse.json({ success: true, date: tomorrowStr, sent: results });
}
