import { supabase, isSupabaseConfigured, RoomRecord, ParticipantRecord } from "./supabase";
import { generateSecretSantaAssignments } from "./derangement";
import crypto from "crypto";

// Fallback in-memory storage when Supabase is not yet configured in .env.local
declare global {
  // eslint-disable-next-line no-var
  var __memoryRooms: Map<string, RoomRecord> | undefined;
  // eslint-disable-next-line no-var
  var __memoryParticipants: Map<string, ParticipantRecord[]> | undefined;
}

const memoryRooms = global.__memoryRooms || new Map<string, RoomRecord>();
const memoryParticipants = global.__memoryParticipants || new Map<string, ParticipantRecord[]>();

if (process.env.NODE_ENV !== "production") {
  global.__memoryRooms = memoryRooms;
  global.__memoryParticipants = memoryParticipants;
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "familia"}-${randomSuffix}`;
}

export interface CreateRoomInput {
  title: string;
  theme?: string;
  budget?: string;
  eventDate?: string;
  adminPin: string;
  participantNames: string[];
}

export async function createRoom(input: CreateRoomInput) {
  const { title, theme = "christmas_90s", budget, eventDate, adminPin, participantNames } = input;

  if (!title || !title.trim()) {
    throw new Error("El título de la sala es obligatorio.");
  }

  const validNames = participantNames.map((n) => n.trim()).filter(Boolean);
  if (validNames.length < 3) {
    throw new Error("Se necesitan al menos 3 participantes.");
  }

  const slug = generateSlug(title);
  const roomId = crypto.randomUUID();

  // Prepare participants with initial UUIDs
  const participantsWithIds = validNames.map((name) => ({
    id: crypto.randomUUID(),
    room_id: roomId,
    name,
  }));

  // Run Hamiltonian cycle derangement
  const assignments = generateSecretSantaAssignments(
    participantsWithIds.map((p) => ({ id: p.id, name: p.name }))
  );

  const fullParticipants: ParticipantRecord[] = participantsWithIds.map((p) => ({
    id: p.id,
    room_id: roomId,
    name: p.name,
    assigned_to_id: assignments[p.id] || null,
    has_drawn: false,
    drawn_at: null,
    wishlist_note: null,
    device_token: null,
    recovery_pin: null,
  }));

  const roomRecord: RoomRecord = {
    id: roomId,
    slug,
    title: title.trim(),
    theme,
    budget: budget?.trim() || null,
    event_date: eventDate?.trim() || null,
    admin_pin: adminPin.trim(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error: roomError } = await supabase.from("rooms").insert({
      id: roomRecord.id,
      slug: roomRecord.slug,
      title: roomRecord.title,
      theme: roomRecord.theme,
      budget: roomRecord.budget,
      event_date: roomRecord.event_date,
      admin_pin: roomRecord.admin_pin,
    });

    if (roomError) {
      throw new Error(`Error al crear la sala en Supabase: ${roomError.message}`);
    }

    const { error: partError } = await supabase.from("participants").insert(
      fullParticipants.map((p) => ({
        id: p.id,
        room_id: p.room_id,
        name: p.name,
        assigned_to_id: p.assigned_to_id,
        has_drawn: false,
      }))
    );

    if (partError) {
      throw new Error(`Error al crear participantes en Supabase: ${partError.message}`);
    }
  } else {
    // Memory fallback
    memoryRooms.set(slug, roomRecord);
    memoryParticipants.set(roomId, fullParticipants);
  }

  return {
    slug,
    room: roomRecord,
    participantsCount: fullParticipants.length,
  };
}

export async function getRoomBySlug(slug: string) {
  let room: RoomRecord | null = null;
  let participants: ParticipantRecord[] = [];

  if (isSupabaseConfigured && supabase) {
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("slug", slug)
      .single();

    if (roomError || !roomData) {
      return null;
    }
    room = roomData as RoomRecord;

    const { data: partData, error: partError } = await supabase
      .from("participants")
      .select("id, room_id, name, has_drawn, drawn_at, wishlist_note, device_token")
      .eq("room_id", room.id)
      .order("name", { ascending: true });

    if (!partError && partData) {
      participants = partData as ParticipantRecord[];
    }
  } else {
    room = memoryRooms.get(slug) || null;
    if (room) {
      participants = memoryParticipants.get(room.id) || [];
    }
  }

  if (!room) return null;

  // Sanitize participants: DO NOT reveal assigned_to_id to public lobby
  const publicParticipants = participants.map((p) => ({
    id: p.id,
    name: p.name,
    has_drawn: Boolean(p.has_drawn),
    wishlist_note: p.wishlist_note,
    drawn_at: p.drawn_at,
  }));

  return {
    room: {
      id: room.id,
      slug: room.slug,
      title: room.title,
      theme: room.theme,
      budget: room.budget,
      event_date: room.event_date,
    },
    participants: publicParticipants,
  };
}

export async function drawPaper(slug: string, participantId: string, deviceToken: string) {
  if (isSupabaseConfigured && supabase) {
    const { data: room, error: rErr } = await supabase
      .from("rooms")
      .select("id")
      .eq("slug", slug)
      .single();

    if (rErr || !room) throw new Error("Sala no encontrada.");

    // Fetch participant
    const { data: part, error: pErr } = await supabase
      .from("participants")
      .select("id, name, assigned_to_id, has_drawn, device_token")
      .eq("id", participantId)
      .eq("room_id", room.id)
      .single();

    if (pErr || !part) throw new Error("Participante no encontrado.");

    if (part.has_drawn) {
      // Check if it's the same device re-opening
      if (part.device_token && part.device_token === deviceToken) {
        // Find assigned participant name
        const { data: target } = await supabase
          .from("participants")
          .select("name, wishlist_note")
          .eq("id", part.assigned_to_id)
          .single();

        return {
          assignedTargetName: target?.name || "Tu amigo secreto",
          targetWishlist: target?.wishlist_note || null,
          isRevisit: true,
        };
      }
      throw new Error("Este papelito ya fue tomado previamente.");
    }

    // Mark as drawn
    const { error: updateErr } = await supabase
      .from("participants")
      .update({
        has_drawn: true,
        drawn_at: new Date().toISOString(),
        device_token: deviceToken,
      })
      .eq("id", participantId);

    if (updateErr) throw new Error("No se pudo registrar la selección del papel.");

    // Retrieve target name
    const { data: target } = await supabase
      .from("participants")
      .select("name, wishlist_note")
      .eq("id", part.assigned_to_id)
      .single();

    return {
      assignedTargetName: target?.name || "Tu amigo secreto",
      targetWishlist: target?.wishlist_note || null,
      isRevisit: false,
    };
  } else {
    // Memory fallback
    const room = memoryRooms.get(slug);
    if (!room) throw new Error("Sala no encontrada.");

    const parts = memoryParticipants.get(room.id) || [];
    const part = parts.find((p) => p.id === participantId);
    if (!part) throw new Error("Participante no encontrado.");

    const targetPart = parts.find((p) => p.id === part.assigned_to_id);

    if (part.has_drawn) {
      if (part.device_token && part.device_token === deviceToken) {
        return {
          assignedTargetName: targetPart?.name || "Tu amigo secreto",
          targetWishlist: targetPart?.wishlist_note || null,
          isRevisit: true,
        };
      }
      throw new Error("Este papelito ya fue tomado previamente.");
    }

    part.has_drawn = true;
    part.drawn_at = new Date().toISOString();
    part.device_token = deviceToken;

    return {
      assignedTargetName: targetPart?.name || "Tu amigo secreto",
      targetWishlist: targetPart?.wishlist_note || null,
      isRevisit: false,
    };
  }
}

export async function updateWishlist(slug: string, participantId: string, wishlistNote: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("participants")
      .update({ wishlist_note: wishlistNote.trim() })
      .eq("id", participantId);

    if (error) throw new Error("No se pudo guardar la pista.");
    return { success: true };
  } else {
    const room = memoryRooms.get(slug);
    if (!room) throw new Error("Sala no encontrada.");
    const parts = memoryParticipants.get(room.id) || [];
    const part = parts.find((p) => p.id === participantId);
    if (!part) throw new Error("Participante no encontrado.");
    part.wishlist_note = wishlistNote.trim();
    return { success: true };
  }
}
