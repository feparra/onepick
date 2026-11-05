import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
