"use client";

import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { Camera, Check, Sparkles, Gift } from "lucide-react";
import { sound } from "@/lib/audio";

interface UnfoldedPaperProps {
  participantName: string;
  assignedTargetName: string;
  budget?: string | null;
  targetWishlist?: string | null;
  initialMyWishlist?: string | null;
  onSaveWishlist?: (note: string) => Promise<void>;
  onBackToLobby: () => void;
}

export default function UnfoldedPaper({
  participantName,
  assignedTargetName,
  budget,
  targetWishlist,
  initialMyWishlist = "",
  onSaveWishlist,
  onBackToLobby,
}: UnfoldedPaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [myWishlist, setMyWishlist] = useState(initialMyWishlist || "");
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    sound.playUnfold();
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    // Launch festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c83e31", "#2e6b4e", "#d4a017", "#fdf8f0"],
    });
  }, []);

  const handleDownloadImage = async () => {
    if (!paperRef.current) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(paperRef.current, {
        backgroundColor: "#2a150c",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `papelito-${participantName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Error al generar la foto del papelito:", e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveWishlist = async () => {
    if (!onSaveWishlist || !myWishlist.trim()) return;
    try {
      setIsSavingWishlist(true);
      await onSaveWishlist(myWishlist.trim());
      setWishlistSaved(true);
      setTimeout(() => setWishlistSaved(false), 3000);
    } catch (e) {
      console.error("Error al guardar wishlist:", e);
    } finally {
      setIsSavingWishlist(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 animate-fade-in pb-10">
      {/* Printable / Capturable Paper Card */}
      <div
        ref={paperRef}
        className="w-full bg-[#fffef7] p-7 md:p-8 rounded-3xl border-4 border-dashed border-[#2e6b4e] shadow-2xl relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(#d6c4a5 1px, transparent 1px), radial-gradient(#d6c4a5 1px, #fffef7 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      >
        {/* Festive corner ribbons */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c83e31] rotate-45 flex items-end justify-center shadow-md">
          <span className="text-white text-[10px] font-bold pb-1 uppercase tracking-widest">
            Secreto
          </span>
        </div>

        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#edf7f1] text-[#23533c] border border-[#a2cfb6]">
            <Sparkles className="w-3.5 h-3.5" /> Papelito de {participantName}
          </span>
          <p className="text-base text-[#614937] font-medium mt-3">
            🤫 Tu amigo secreto es:
          </p>
        </div>

        {/* Big name reveal */}
        <div className="my-4 py-5 px-3 bg-[#fdf5e6] rounded-2xl border-3 border-[#dfcaa7] shadow-inner text-center">
          <span className="text-3xl md:text-4xl font-serif font-black text-[#b8291d] tracking-tight block drop-shadow-sm">
            {assignedTargetName}
          </span>
        </div>

        {/* Budget reminder if present */}
        {budget && (
          <div className="text-center py-2 px-3 bg-[#eef5f1] rounded-xl border border-[#c4e0ce] mb-3">
            <p className="text-xs text-[#285b40] font-semibold">
              💰 Presupuesto sugerido: <strong>{budget}</strong>
            </p>
          </div>
        )}

        {/* Target's wishlist clue if they wrote one */}
        {targetWishlist && (
          <div className="p-3 bg-[#fef8e8] border border-[#f2d488] rounded-xl text-left mb-3">
            <p className="text-xs font-bold text-[#8f5a15] flex items-center gap-1.5 mb-1">
              <Gift className="w-3.5 h-3.5" /> Pista dejada por {assignedTargetName}:
            </p>
            <p className="text-sm text-[#473016] italic">
              &quot;{targetWishlist}&quot;
            </p>
          </div>
        )}

        <p className="text-xs text-[#7e6957] text-center italic mt-2">
          ¡No se lo digas a nadie de la familia! Guárdalo bien en tu memoria o toma una foto.
        </p>
      </div>

      {/* Action 1: Save photo for elders who forget easily */}
      <button
        onClick={handleDownloadImage}
        disabled={isCapturing}
        className="w-full py-4 px-6 bg-[#c83e31] hover:bg-[#b03226] text-white text-xl font-bold rounded-2xl border-b-4 border-[#822118] shadow-xl flex items-center justify-center gap-3 active:translate-y-0.5 transition-all"
      >
        <Camera className="w-7 h-7" />
        <span>{isCapturing ? "Guardando foto..." : "📸 Guardar Foto de mi Papelito"}</span>
      </button>

      {/* Action 2: Leave a clue for their own Secret Santa */}
      {onSaveWishlist && (
        <div className="w-full bg-[#fcf8f0] p-5 rounded-2xl border-2 border-[#d4be98] shadow-md">
          <label className="block text-sm md:text-base font-bold text-[#3e2518] mb-1">
            🎁 ¿Qué te gustaría que te regalen a ti?
          </label>
          <p className="text-xs text-[#6e5443] mb-3">
            Escribe una pequeña pista para quien te sacó a ti (ej: &quot;dulces, libros o medias talla L&quot;).
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={myWishlist}
              onChange={(e) => setMyWishlist(e.target.value)}
              placeholder="Escribe tu idea de regalo aquí..."
              className="w-full px-4 py-3 text-base bg-white border-2 border-[#ccb893] rounded-xl text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
            />
            <button
              onClick={handleSaveWishlist}
              disabled={isSavingWishlist || !myWishlist.trim()}
              className="py-3 px-4 bg-[#2e6b4e] hover:bg-[#23533c] disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {wishlistSaved ? (
                <>
                  <Check className="w-5 h-5" /> ¡Pista guardada con éxito!
                </>
              ) : isSavingWishlist ? (
                "Guardando..."
              ) : (
                "Guardar mi pista"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Back to Room Lobby */}
      <button
        onClick={onBackToLobby}
        className="w-full py-3 text-[#fdf8f0] font-bold text-base hover:underline text-center"
      >
        ⬅️ Volver a la lista de la familia
      </button>
    </div>
  );
}
