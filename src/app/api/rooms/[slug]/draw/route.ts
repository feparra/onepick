import { NextResponse } from "next/server";
import { drawPaper } from "@/lib/roomService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { participantId, deviceToken, pin } = body;

    if (!participantId || !deviceToken || !pin) {
      return NextResponse.json(
        { error: "Identificador de participante, token y PIN de 4 dígitos son requeridos." },
        { status: 400 }
      );
    }

    const result = await drawPaper(slug, participantId, deviceToken, pin);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sacar el papelito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
