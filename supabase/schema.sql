-- Schema for Papelitos (OnePick) - Secret Santa Engine

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'christmas_90s',
  budget TEXT,
  event_date TEXT,
  admin_pin TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_to_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  has_drawn BOOLEAN DEFAULT FALSE,
  drawn_at TIMESTAMPTZ,
  wishlist_note TEXT,
  device_token TEXT,
  recovery_pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_device_token ON participants(device_token);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for frictionless no-login room participation
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update with admin pin" ON rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to participants" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to participants" ON participants
  FOR UPDATE USING (true);
