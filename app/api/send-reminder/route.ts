import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendReminderEmail } from "@/lib/email";
import type { Appointment, Service, Config } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return NextResponse.json({ success: false, error: "appointmentId requerido" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Load appointment with service and config
    const [apptRes, configRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, service:services(*)")
        .eq("id", appointmentId)
        .single(),
      supabase.from("config").select("*").single(),
    ]);

    if (apptRes.error || !apptRes.data) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    }

    const appointment = apptRes.data as Appointment & { service: Service };
    const config = configRes.data as Config;

    if (!appointment.client_email) {
      return NextResponse.json({ success: false, error: "El cliente no tiene email" });
    }

    const result = await sendReminderEmail({
      appointment,
      service: appointment.service,
      config,
    });

    if (result.success) {
      // Mark reminder as sent
      await supabase
        .from("appointments")
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq("id", appointmentId);
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
