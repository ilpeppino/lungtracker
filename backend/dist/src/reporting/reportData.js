import { supabaseAdmin } from "../db/supabaseAdmin.js";
export async function fetchReportData(params) {
    const { userId, rangeStart, rangeEnd } = params;
    const vitals = await supabaseAdmin
        .from("vitals_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("measured_at", rangeStart)
        .lte("measured_at", rangeEnd)
        .order("measured_at", { ascending: true });
    const activities = await supabaseAdmin
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .gte("performed_at", rangeStart)
        .lte("performed_at", rangeEnd)
        .order("performed_at", { ascending: true });
    const events = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .gte("event_at", rangeStart)
        .lte("event_at", rangeEnd)
        .order("event_at", { ascending: true });
    if (vitals.error)
        throw vitals.error;
    if (activities.error)
        throw activities.error;
    if (events.error)
        throw events.error;
    return {
        vitals: vitals.data ?? [],
        activities: activities.data ?? [],
        events: events.data ?? []
    };
}
