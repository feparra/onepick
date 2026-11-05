import { NextResponse } from "next/server";
import { createRoom } from "@/lib/roomService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, theme, budget, eventDate, adminPin, participantNames } = body;

    if (!title || !adminPin || !participantNames || !Array.isArray(participantNames)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (título, PIN o participantes)." },
        { status: 400 }
      );
    }

    if (adminPin.length !== 4) {
      return NextResponse.json(
        { error: "El PIN del anfitrión debe ser de 4 dígitos." },
        { status: 400 }
      );
    }

    const result = await createRoom({
      title,
      theme,
      budget,
      eventDate,
      adminPin,
      participantNames,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
