import { NextResponse } from "next/server";
import { drawPaper } from "@/lib/roomService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { participantId, deviceToken } = body;

    if (!participantId || !deviceToken) {
      return NextResponse.json(
        { error: "Identificador de participante o token de dispositivo inválido." },
        { status: 400 }
      );
    }

    const result = await drawPaper(slug, participantId, deviceToken);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sacar el papelito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
