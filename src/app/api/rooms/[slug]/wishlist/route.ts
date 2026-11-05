import { NextResponse } from "next/server";
import { updateWishlist } from "@/lib/roomService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { participantId, wishlistNote } = body;

    if (!participantId || typeof wishlistNote !== "string") {
      return NextResponse.json(
        { error: "Parámetros inválidos." },
        { status: 400 }
      );
    }

    const result = await updateWishlist(slug, participantId, wishlistNote);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar la pista";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
