import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  try {
    // Fetch websites to monitor
    const { data: sites, error } = await supabase
      .from("monitored_sites")
      .select("*")
      .limit(500);

    if (error) throw error;

    for (const s of sites || []) {
      // Call your own scan endpoint
      const res = await fetch(`${process.env.APP_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: s.url, competitor: s.competitor, depth: "Standard" }),
      });

      const scan = await res.json();

      // Store scan history
      await supabase.from("scan_history").insert({
        site_id: s.id,
        url: s.url,
        scores: scan.scores,
        schemaTypes: scan.schemaTypes || [],
        entities: scan.entities || [],
        created_at: new Date().toISOString(),
      });

      // Simple alerting rules (you can expand)
      if (scan?.scores?.authority !== undefined && scan.scores.authority < (s.alert_threshold || 45)) {
        await supabase.from("alerts").insert({
          site_id: s.id,
          type: "authority_drop",
          message: `Authority score dropped to ${scan.scores.authority}.`,
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ ok: true, processed: (sites || []).length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Cron failed" }, { status: 500 });
  }
}