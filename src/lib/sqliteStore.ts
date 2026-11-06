import path from "path";
import fs from "fs";
import { RoomRecord, ParticipantRecord } from "./supabase";

interface SQLiteDatabase {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...args: unknown[]) => unknown;
    get: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown[];
  };
}

let dbInstance: SQLiteDatabase | null = null;

function getDatabase(): SQLiteDatabase {
  if (dbInstance) return dbInstance;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, "papelitos.sqlite");
    const db = new DatabaseSync(dbPath) as SQLiteDatabase;

    db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        theme TEXT NOT NULL DEFAULT 'christmas_90s',
        budget TEXT,
        event_date TEXT,
        admin_pin TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        name TEXT NOT NULL,
        assigned_to_id TEXT,
        has_drawn INTEGER DEFAULT 0,
        drawn_at TEXT,
        wishlist_note TEXT,
        device_token TEXT,
        recovery_pin TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
      CREATE INDEX IF NOT EXISTS idx_participants_room ON participants(room_id);
    `);

    dbInstance = db;
    return db;
  } catch (e) {
    console.warn("node:sqlite initialization error, falling back to memory:", e);
    throw e;
  }
}

export const sqliteStore = {
  isAvailable(): boolean {
    try {
      getDatabase();
      return true;
    } catch {
      return false;
    }
  },

  createRoom(room: RoomRecord, participants: ParticipantRecord[]) {
    const db = getDatabase();
    const insertRoom = db.prepare(`
      INSERT INTO rooms (id, slug, title, theme, budget, event_date, admin_pin, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertRoom.run(
      room.id,
      room.slug,
      room.title,
      room.theme,
      room.budget,
      room.event_date,
      room.admin_pin,
      room.created_at || new Date().toISOString()
    );

    const insertPart = db.prepare(`
      INSERT INTO participants (id, room_id, name, assigned_to_id, has_drawn, drawn_at, wishlist_note, device_token, recovery_pin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of participants) {
      insertPart.run(
        p.id,
        p.room_id,
        p.name,
        p.assigned_to_id,
        p.has_drawn ? 1 : 0,
        p.drawn_at,
        p.wishlist_note,
        p.device_token,
        p.recovery_pin
      );
    }
  },

  getRoomBySlug(slug: string): { room: RoomRecord; participants: ParticipantRecord[] } | null {
    const db = getDatabase();
    const queryRoom = db.prepare(`SELECT * FROM rooms WHERE slug = ?`);
    const room = queryRoom.get(slug) as RoomRecord | undefined;
    if (!room) return null;

    const queryParts = db.prepare(`SELECT * FROM participants WHERE room_id = ? ORDER BY name ASC`);
    const rawParts = queryParts.all(room.id) as Array<{
      id: string;
      room_id: string;
      name: string;
      assigned_to_id: string | null;
      has_drawn: number | boolean;
      drawn_at: string | null;
      wishlist_note: string | null;
      device_token: string | null;
      recovery_pin: string | null;
    }>;

    const participants: ParticipantRecord[] = rawParts.map((p) => ({
      ...p,
      has_drawn: Boolean(p.has_drawn),
    }));

    return { room, participants };
  },

  updateParticipantDrawn(id: string, deviceToken: string, pin: string) {
    const db = getDatabase();
    const update = db.prepare(`
      UPDATE participants
      SET has_drawn = 1, drawn_at = ?, device_token = ?, recovery_pin = ?
      WHERE id = ?
    `);
    update.run(new Date().toISOString(), deviceToken, pin, id);
  },

  updateParticipantWishlist(id: string, note: string) {
    const db = getDatabase();
    const update = db.prepare(`UPDATE participants SET wishlist_note = ? WHERE id = ?`);
    update.run(note, id);
  },
};

