import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

// Normalize URL in case user pasted the REST endpoint (/rest/v1) or trailing slash
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface RoomRecord {
  id: string;
  slug: string;
  title: string;
  theme: string;
  budget: string | null;
  event_date: string | null;
  admin_pin: string;
  created_at?: string;
}

export interface ParticipantRecord {
  id: string;
  room_id: string;
  name: string;
  assigned_to_id: string | null;
  has_drawn: boolean;
  drawn_at: string | null;
  wishlist_note: string | null;
  device_token: string | null;
  recovery_pin: string | null;
  assigned_name?: string | null;
}
