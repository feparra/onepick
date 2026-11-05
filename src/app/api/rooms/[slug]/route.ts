import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/lib/roomService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const roomData = await getRoomBySlug(slug);

    if (!roomData) {
      return NextResponse.json(
        { error: "La sala de Amigo Secreto no existe o el enlace es incorrecto." },
        { status: 404 }
      );
    }

    return NextResponse.json(roomData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener la sala";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
