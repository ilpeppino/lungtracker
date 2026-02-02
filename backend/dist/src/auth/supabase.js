import { supabaseAdmin } from "../db/supabaseAdmin.js";
export async function requireSupabaseUser(authHeader) {
    if (!authHeader?.startsWith("Bearer "))
        throw new Error("Missing bearer token");
    const token = authHeader.slice("Bearer ".length);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error)
        throw new Error("Invalid or expired token");
    if (!data.user?.id)
        throw new Error("No user in token");
    return { userId: data.user.id };
}
