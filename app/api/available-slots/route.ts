import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTimeSlots } from "@/lib/utils";
import type { Config, Appointment } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service_id");

  if (!date || !serviceId) {
    return NextResponse.json({ error: "Parámetros requeridos: date, service_id" }, { status: 400 });
  }

  const [configRes, serviceRes, apptRes] = await Promise.all([
    supabase.from("config").select("*").single(),
    supabase.from("services").select("duration").eq("id", serviceId).single(),
    supabase
      .from("appointments")
      .select("start_time, end_time, status")
      .eq("appointment_date", date)
      .neq("status", "cancelled"),
  ]);

  if (!configRes.data || !serviceRes.data) {
    return NextResponse.json({ slots: [] });
  }

  const slots = generateTimeSlots(
    configRes.data as Config,
    date,
    (apptRes.data || []) as Appointment[],
    serviceRes.data.duration
  );

  return NextResponse.json({ slots });
}
