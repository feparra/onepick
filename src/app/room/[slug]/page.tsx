"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { ThemeProvider, ThemeKey } from "@/components/ThemeProvider";
import ParticipantList, { ParticipantItem } from "@/components/ParticipantList";
import PaperTable from "@/components/PaperTable";
import UnfoldedPaper from "@/components/UnfoldedPaper";

interface RoomData {
  id: string;
  slug: string;
  title: string;
  theme: string;
  budget: string | null;
  event_date: string | null;
}

interface StoredToken {
  participantId: string;
  participantName: string;
  deviceToken: string;
}

function RoomContent() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [room, setRoom] = useState<RoomData | null>(null);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active view: "lobby" | "table" | "revealed"
  const [viewState, setViewState] = useState<"lobby" | "table" | "revealed">("lobby");

  // Selected participant for current draw
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantItem | null>(null);
  const [assignedTargetName, setAssignedTargetName] = useState<string>("");
  const [targetWishlist, setTargetWishlist] = useState<string | null>(null);

  // Stored local session token
  const [savedSession, setSavedSession] = useState<StoredToken | null>(null);

  // Device token generator/retriever
  const getOrCreateDeviceToken = useCallback((): string => {
    if (typeof window === "undefined") return "";
    let token = localStorage.getItem("santa_device_id");
    if (!token) {
      token = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("santa_device_id", token);
    }
    return token;
  }, []);

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/rooms/${slug}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar la información de la sala.");
      }
      const data = await res.json();
      setRoom(data.room);
      setParticipants(data.participants);

      // Check localStorage for saved paper in this room
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(`santa_token_${data.room.id}`);
        if (raw) {
          try {
            const parsed: StoredToken = JSON.parse(raw);
            setSavedSession(parsed);
          } catch {
            // Ignore malformed token
          }
        }
      }
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : "Error al cargar la sala");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRoom();
    // Live polling every 5s so when family members pick their paper, everyone sees live badges
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // When user selects their name and confirms
  const handleSelectParticipant = (p: ParticipantItem) => {
    setCurrentParticipant(p);
    setViewState("table");
  };

  // Called when user picks a paper on the table
  const handlePaperOpened = async () => {
    if (!currentParticipant || !room) return;
    const deviceToken = getOrCreateDeviceToken();

    const res = await fetch(`/api/rooms/${slug}/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: currentParticipant.id,
        deviceToken,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al abrir el papelito");
    }

    setAssignedTargetName(data.assignedTargetName);
    setTargetWishlist(data.targetWishlist || null);

    // Save in localStorage so Roberto can re-open his ticket anytime
    const sessionObj: StoredToken = {
      participantId: currentParticipant.id,
      participantName: currentParticipant.name,
      deviceToken,
    };
    localStorage.setItem(`santa_token_${room.id}`, JSON.stringify(sessionObj));
    setSavedSession(sessionObj);

    // Refresh participants list to update "Ya escogió" badge
    fetchRoom();
  };

  // Re-open ticket if Roberto already drew
  const handleReopenSaved = async () => {
    if (!savedSession || !room) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/rooms/${slug}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: savedSession.participantId,
          deviceToken: savedSession.deviceToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentParticipant({
        id: savedSession.participantId,
        name: savedSession.participantName,
        has_drawn: true,
      });
      setAssignedTargetName(data.assignedTargetName);
      setTargetWishlist(data.targetWishlist || null);
      setViewState("revealed");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al re-abrir tu papelito");
    } finally {
      setIsLoading(false);
    }
  };

  // Save wish clue
  const handleSaveWishlist = async (note: string) => {
    if (!currentParticipant) return;
    await fetch(`/api/rooms/${slug}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: currentParticipant.id,
        wishlistNote: note,
      }),
    });
    fetchRoom();
  };

  if (isLoading && !room) {
    return (
      <div className="w-full min-h-screen bg-[#2a150c] flex flex-col items-center justify-center p-4 text-[#fdf8f0]">
        <Loader2 className="w-10 h-10 animate-spin text-[#c83e31] mb-3" />
        <p className="text-lg font-serif">Preparando la mesa familiar...</p>
      </div>
    );
  }

  if (errorMessage || !room) {
    return (
      <div className="w-full min-h-screen bg-[#2a150c] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#fffef7] border-4 border-[#c83e31] p-6 rounded-3xl max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-serif font-black text-[#2b1810] mb-2">
            Sala no encontrada
          </h2>
          <p className="text-base text-[#614534] mb-6">
            {errorMessage || "El enlace no corresponde a ninguna sala activa."}
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 bg-[#2e6b4e] text-white font-bold rounded-xl"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={(room.theme as ThemeKey) || "christmas_90s"}>
      <div className="w-full min-h-screen bg-[#2a150c] p-4 md:p-8 flex flex-col items-center">
        {/* Top Header */}
        <header className="w-full max-w-xl text-center mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#debda6] hover:text-white font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Inicio
            </Link>
            <span className="text-xs uppercase tracking-wider text-[#d29b72] font-bold">
              Amigo Secreto Familiar
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-black text-[#fdf8f0] tracking-tight">
            {room.title}
          </h1>

          <div className="flex items-center justify-center gap-3 mt-2 text-xs md:text-sm text-[#e6cfbf] font-medium">
            {room.budget && (
              <span className="bg-[#422214] px-3 py-1 rounded-full border border-[#5c311e]">
                💰 Presupuesto: <strong>{room.budget}</strong>
              </span>
            )}
            {room.event_date && (
              <span className="bg-[#422214] px-3 py-1 rounded-full border border-[#5c311e]">
                📅 Fecha: <strong>{room.event_date}</strong>
              </span>
            )}
          </div>
        </header>

        {/* View Mode Switching */}
        {viewState === "lobby" && (
          <main className="w-full max-w-lg">
            <ParticipantList
              participants={participants}
              savedParticipantId={savedSession?.participantId}
              savedParticipantName={savedSession?.participantName}
              onSelectParticipant={handleSelectParticipant}
              onReopenSaved={handleReopenSaved}
            />
          </main>
        )}

        {viewState === "table" && currentParticipant && (
          <main className="w-full max-w-xl">
            <PaperTable
              participantName={currentParticipant.name}
              assignedTargetName={assignedTargetName}
              totalPapers={participants.length}
              budget={room.budget}
              targetWishlist={targetWishlist}
              initialMyWishlist={currentParticipant.wishlist_note}
              onPaperOpened={handlePaperOpened}
              onSaveWishlist={handleSaveWishlist}
              onBackToLobby={() => {
                setViewState("lobby");
                fetchRoom();
              }}
            />
          </main>
        )}

        {viewState === "revealed" && currentParticipant && (
          <main className="w-full max-w-md">
            <UnfoldedPaper
              participantName={currentParticipant.name}
              assignedTargetName={assignedTargetName}
              budget={room.budget}
              targetWishlist={targetWishlist}
              initialMyWishlist={currentParticipant.wishlist_note}
              onSaveWishlist={handleSaveWishlist}
              onBackToLobby={() => {
                setViewState("lobby");
                fetchRoom();
              }}
            />
          </main>
        )}

        {/* Footer info */}
        <footer className="mt-8 text-center text-xs text-[#8f6d57]">
          <p className="flex items-center justify-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#c83e31]" />
            Papelitos — Desarrollado para familias de todas las edades
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#2a150c] flex flex-col items-center justify-center p-4 text-[#fdf8f0]">
          <Loader2 className="w-10 h-10 animate-spin text-[#c83e31] mb-3" />
          <p className="text-lg font-serif">Cargando sala...</p>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
