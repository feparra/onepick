"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Camera, Check, Sparkles, Gift, Crown } from "lucide-react";
import { sound } from "@/lib/audio";
import { useLanguage } from "@/lib/i18n";

interface UnfoldedPaperProps {
  participantName: string;
  assignedTargetName: string;
  budget?: string | null;
  targetWishlist?: string | null;
  initialMyWishlist?: string | null;
  goldenTicketName?: string | null;
  onSaveWishlist?: (note: string) => Promise<void>;
  onBackToLobby: () => void;
}

/**
 * Helper to draw rounded rectangles on an HTML5 2D Canvas.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function UnfoldedPaper({
  participantName,
  assignedTargetName,
  budget,
  targetWishlist,
  initialMyWishlist = "",
  goldenTicketName,
  onSaveWishlist,
  onBackToLobby,
}: UnfoldedPaperProps) {
  const { t } = useLanguage();
  const [myWishlist, setMyWishlist] = useState(initialMyWishlist || "");
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGoldenTicket, setShowGoldenTicket] = useState(false);

  useEffect(() => {
    sound.playUnfold();
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c83e31", "#2e6b4e", "#d4a017", "#fdf8f0"],
    });

    if (goldenTicketName) {
      const timer = setTimeout(() => {
        setShowGoldenTicket(true);
        sound.playUnfold();
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([80, 40, 200]);
        }
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.55 },
          colors: ["#FFD700", "#FFA500", "#DAA520", "#FFF8DC"],
        });
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [goldenTicketName]);

  /**
   * Generates a high-resolution PNG directly via HTML5 Canvas 2D API.
   * Avoids html2canvas crashes caused by Tailwind v4 oklch() color functions.
   */
  const handleDownloadImage = async () => {
    try {
      setIsCapturing(true);

      const width = 800;
      const hasGold = Boolean(goldenTicketName);
      const height = hasGold ? 1120 : 680;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Warm wood background
      ctx.fillStyle = "#2a150c";
      ctx.fillRect(0, 0, width, height);

      // 2. Main Paper Card
      const cardX = 48;
      const cardY = 48;
      const cardW = width - 96;
      const cardH = 560;

      ctx.fillStyle = "#fffef7";
      roundRect(ctx, cardX, cardY, cardW, cardH, 36);
      ctx.fill();

      // Dashed green border
      ctx.save();
      ctx.strokeStyle = "#2e6b4e";
      ctx.lineWidth = 6;
      ctx.setLineDash([14, 10]);
      roundRect(ctx, cardX + 6, cardY + 6, cardW - 12, cardH - 12, 30);
      ctx.stroke();
      ctx.restore();

      // Top badge ("Papelito de [Nombre]")
      ctx.fillStyle = "#edf7f1";
      roundRect(ctx, width / 2 - 180, cardY + 38, 360, 46, 23);
      ctx.fill();
      ctx.strokeStyle = "#a2cfb6";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#23533c";
      ctx.font = "bold 22px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `✨ ${t.unfolded.paperOf} ${participantName}`,
        width / 2,
        cardY + 68
      );

      // Subtitle ("Tu amigo secreto es:")
      ctx.fillStyle = "#614937";
      ctx.font = "600 26px sans-serif";
      ctx.fillText(t.unfolded.secretIs, width / 2, cardY + 135);

      // Target Name Box
      const boxX = cardX + 48;
      const boxY = cardY + 165;
      const boxW = cardW - 96;
      const boxH = 140;

      ctx.fillStyle = "#fdf5e6";
      roundRect(ctx, boxX, boxY, boxW, boxH, 24);
      ctx.fill();
      ctx.strokeStyle = "#dfcaa7";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#b8291d";
      ctx.font = "900 54px Georgia, serif";
      ctx.fillText(assignedTargetName, width / 2, boxY + 88);

      // Budget & Clue
      let currentY = boxY + boxH + 45;
      if (budget) {
        ctx.fillStyle = "#285b40";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(`${t.unfolded.budgetSuggested} ${budget}`, width / 2, currentY);
        currentY += 42;
      }

      if (targetWishlist) {
        ctx.fillStyle = "#8f5a15";
        ctx.font = "italic 22px sans-serif";
        const snippet =
          targetWishlist.length > 50
            ? targetWishlist.substring(0, 50) + "..."
            : targetWishlist;
        ctx.fillText(
          `🎁 ${t.unfolded.clueFrom} ${assignedTargetName}: "${snippet}"`,
          width / 2,
          currentY
        );
        currentY += 42;
      }

      // Footer note
      ctx.fillStyle = "#7e6957";
      ctx.font = "italic 19px sans-serif";
      ctx.fillText(t.unfolded.familySecretNote, width / 2, cardY + cardH - 34);

      // 3. Optional Golden Ticket Card
      if (hasGold && goldenTicketName) {
        const goldY = cardY + cardH + 36;
        const goldH = 420;

        const grad = ctx.createLinearGradient(cardX, goldY, cardX + cardW, goldY + goldH);
        grad.addColorStop(0, "#fff6cc");
        grad.addColorStop(0.5, "#ffd23f");
        grad.addColorStop(1, "#ffef99");

        ctx.fillStyle = grad;
        roundRect(ctx, cardX, goldY, cardW, goldH, 36);
        ctx.fill();

        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Badge
        ctx.fillStyle = "#785004";
        roundRect(ctx, width / 2 - 200, goldY + 30, 400, 42, 21);
        ctx.fill();

        ctx.fillStyle = "#fff6cc";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(t.unfolded.goldenBadge, width / 2, goldY + 58);

        // Title
        ctx.fillStyle = "#4a3000";
        ctx.font = "900 32px Georgia, serif";
        ctx.fillText(`✨ ${t.unfolded.goldenTitle} ✨`, width / 2, goldY + 115);

        // Decree text
        ctx.fillStyle = "#5e3d02";
        ctx.font = "bold 21px sans-serif";
        ctx.fillText(t.unfolded.goldenDecree, width / 2, goldY + 158);

        // Baby/Honoree Name Box
        const gBoxY = goldY + 185;
        ctx.fillStyle = "#fffdf2";
        roundRect(ctx, boxX, gBoxY, boxW, 120, 24);
        ctx.fill();
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#945d00";
        ctx.font = "900 48px Georgia, serif";
        ctx.fillText(`👶 ${goldenTicketName} 👑`, width / 2, gBoxY + 76);

        ctx.fillStyle = "#5c3c04";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(t.unfolded.goldenFooter, width / 2, goldY + goldH - 36);
      }

      // Trigger file download via Blob URL
      const dataUrl = canvas.toDataURL("image/png");
      const safeName = participantName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-");

      const link = document.createElement("a");
      link.download = `papelito-${safeName || "secreto"}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating paper image:", e);
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
      console.error("Error saving wishlist:", e);
    } finally {
      setIsSavingWishlist(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 animate-fade-in pb-10">
      <div className="w-full flex flex-col gap-5">
        {/* 1. Primary Secret Santa Paper Card */}
        <div
          className="w-full bg-[#fffef7] p-7 md:p-8 rounded-3xl border-4 border-dashed border-[#2e6b4e] shadow-2xl relative overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(#d6c4a5 1px, transparent 1px), radial-gradient(#d6c4a5 1px, #fffef7 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c83e31] rotate-45 flex items-end justify-center shadow-md">
            <span className="text-white text-[10px] font-bold pb-1 uppercase tracking-widest">
              {t.unfolded.cornerRibbon}
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#edf7f1] text-[#23533c] border border-[#a2cfb6]">
              <Sparkles className="w-3.5 h-3.5" /> {t.unfolded.paperOf} {participantName}
            </span>
            <p className="text-base text-[#614937] font-medium mt-3">
              {t.unfolded.secretIs}
            </p>
          </div>

          <div className="my-4 py-5 px-3 bg-[#fdf5e6] rounded-2xl border-3 border-[#dfcaa7] shadow-inner text-center">
            <span className="text-3xl md:text-4xl font-serif font-black text-[#b8291d] tracking-tight block drop-shadow-sm">
              {assignedTargetName}
            </span>
          </div>

          {budget && (
            <div className="text-center py-2 px-3 bg-[#eef5f1] rounded-xl border border-[#c4e0ce] mb-3">
              <p className="text-xs text-[#285b40] font-semibold">
                {t.unfolded.budgetSuggested} <strong>{budget}</strong>
              </p>
            </div>
          )}

          {targetWishlist && (
            <div className="p-3 bg-[#fef8e8] border border-[#f2d488] rounded-xl text-left mb-3">
              <p className="text-xs font-bold text-[#8f5a15] flex items-center gap-1.5 mb-1">
                <Gift className="w-3.5 h-3.5" /> {t.unfolded.clueFrom} {assignedTargetName}:
              </p>
              <p className="text-sm text-[#473016] italic">
                &quot;{targetWishlist}&quot;
              </p>
            </div>
          )}

          <p className="text-xs text-[#7e6957] text-center italic mt-2">
            {t.unfolded.familySecretNote}
          </p>
        </div>

        {/* 2. Surprise GOLDEN TICKET (Papelito Dorado VIP) */}
        <AnimatePresence>
          {goldenTicketName && showGoldenTicket && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotateX: 45, y: 20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="w-full p-6 md:p-7 rounded-3xl border-4 border-[#b8860b] shadow-2xl relative overflow-hidden text-center"
              style={{
                background:
                  "linear-gradient(135deg, #fff6cc 0%, #ffe680 35%, #ffd23f 70%, #ffef99 100%)",
              }}
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#785004] text-[#fff6cc] shadow-sm mb-3">
                <Crown className="w-4 h-4 text-[#ffd700]" />
                <span>{t.unfolded.goldenBadge}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-serif font-black text-[#4a3000] tracking-tight">
                ✨ {t.unfolded.goldenTitle} ✨
              </h3>

              <p className="text-sm md:text-base font-bold text-[#5e3d02] mt-2 leading-snug">
                {t.unfolded.goldenDecree}
              </p>

              <div className="my-4 py-4 px-4 bg-[#fffdf2] rounded-2xl border-3 border-[#b8860b] shadow-lg">
                <span className="text-3xl md:text-4xl font-serif font-black text-[#945d00] tracking-tight block">
                  👶 {goldenTicketName} 👑
                </span>
              </div>

              <p className="text-xs md:text-sm font-bold text-[#5c3c04] bg-[#fff5c0]/80 py-2 px-3 rounded-xl border border-[#d4a017]">
                {t.unfolded.goldenFooter}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action 1: Save photo */}
      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={isCapturing}
        className="w-full py-4 px-6 bg-[#c83e31] hover:bg-[#b03226] text-white text-xl font-bold rounded-2xl border-b-4 border-[#822118] shadow-xl flex items-center justify-center gap-3 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <Camera className="w-7 h-7" />
        <span>{isCapturing ? t.unfolded.savingPhoto : t.unfolded.savePhotoButton}</span>
      </button>

      {/* Action 2: Wishlist note */}
      {onSaveWishlist && (
        <div className="w-full bg-[#fcf8f0] p-5 rounded-2xl border-2 border-[#d4be98] shadow-md">
          <label className="block text-sm md:text-base font-bold text-[#3e2518] mb-1">
            {t.unfolded.wishlistQuestion}
          </label>
          <p className="text-xs text-[#6e5443] mb-3">
            {t.unfolded.wishlistSub}
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={myWishlist}
              onChange={(e) => setMyWishlist(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white border-2 border-[#ccb893] rounded-xl text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
            />
            <button
              type="button"
              onClick={handleSaveWishlist}
              disabled={isSavingWishlist || !myWishlist.trim()}
              className="py-3 px-4 bg-[#2e6b4e] hover:bg-[#23533c] disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {wishlistSaved ? (
                <>
                  <Check className="w-5 h-5" /> {t.unfolded.wishlistSaved}
                </>
              ) : isSavingWishlist ? (
                t.common.saving
              ) : (
                t.unfolded.saveWishlistButton
              )}
            </button>
          </div>
        </div>
      )}

      {/* Back to Lobby */}
      <button
        type="button"
        onClick={onBackToLobby}
        className="w-full py-3 text-[#fdf8f0] font-bold text-base hover:underline text-center cursor-pointer"
      >
        {t.unfolded.backToList}
      </button>
    </div>
  );
}
