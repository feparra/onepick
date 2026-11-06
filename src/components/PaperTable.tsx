"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/audio";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/lib/i18n";
import UnfoldedPaper from "./UnfoldedPaper";

interface PaperTableProps {
  participantName: string;
  assignedTargetName: string;
  totalPapers: number;
  budget?: string | null;
  targetWishlist?: string | null;
  initialMyWishlist?: string | null;
  goldenTicketName?: string | null;
  onPaperOpened: () => Promise<void>;
  onSaveWishlist?: (note: string) => Promise<void>;
  onBackToLobby: () => void;
}

interface PaperPosition {
  id: number;
  x: number;
  y: number;
  rotate: number;
}

export default function PaperTable({
  participantName,
  assignedTargetName,
  totalPapers,
  budget,
  targetWishlist,
  initialMyWishlist,
  goldenTicketName,
  onPaperOpened,
  onSaveWishlist,
  onBackToLobby,
}: PaperTableProps) {
  const { config } = useTheme();
  const { t } = useLanguage();
  const [stage, setStage] = useState<
    "ready" | "shuffling" | "spread" | "unfolding" | "revealed"
  >("ready");
  const [selectedPaperIndex, setSelectedPaperIndex] = useState<number | null>(
    null
  );

  // Exact number of papers equals the number of participants
  const visibleCount = Math.max(totalPapers, 1);

  // Initial pile in the center of the table so all N papers are visibly stacked
  const initialPile = useMemo<PaperPosition[]>(() => {
    return Array.from({ length: visibleCount }, (_, i) => {
      const angle = (i / visibleCount) * Math.PI * 2;
      const radius = Math.min(18, i * 3.5);
      return {
        id: i,
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
        rotate: ((i % 2 === 0 ? 1 : -1) * ((i * 11) % 28)),
      };
    });
  }, [visibleCount]);

  const [paperPositions, setPaperPositions] =
    useState<PaperPosition[]>(initialPile);

  // Precompute organic multi-pass swirl keyframes for each paper during shuffle
  const shuffleKeyframes = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, idx) => {
      const dirX = idx % 2 === 0 ? 1 : -1;
      const dirY = idx % 3 === 0 ? -1 : 1;
      const offset = (idx % 4) * 18;
      return {
        x: [
          0,
          dirX * (85 + offset),
          -dirX * (70 + offset * 0.5),
          dirY * (95 - offset * 0.4),
          -dirY * 60,
          dirX * 45,
          0,
        ],
        y: [
          0,
          dirY * (65 + offset * 0.6),
          -dirY * (80 + offset * 0.4),
          -dirX * 55,
          dirX * 75,
          -dirY * 35,
          0,
        ],
        rotate: [
          0,
          dirX * 140,
          -dirX * 220,
          dirY * 310,
          -dirY * 190,
          dirX * 360,
          ((idx * 17) % 30) - 15,
        ],
      };
    });
  }, [visibleCount]);

  const handleShuffle = () => {
    setStage("shuffling");
    sound.playShuffle();
    // Second rustle sound midway through the hand-mixing motion
    setTimeout(() => {
      sound.playShuffle();
    }, 850);

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 60, 40, 80, 40, 100]);
    }

    // Calculate organic table spread for the exact number of participants
    setTimeout(() => {
      const cols =
        visibleCount <= 3
          ? visibleCount
          : visibleCount === 4
          ? 2
          : visibleCount <= 9
          ? 3
          : 4;
      const rows = Math.ceil(visibleCount / cols);

      const spacingX = cols <= 2 ? 120 : cols === 3 ? 102 : 78;
      const spacingY = rows <= 2 ? 105 : rows === 3 ? 88 : 72;

      const spreadPositions = Array.from({ length: visibleCount }, (_, idx) => {
        const row = Math.floor(idx / cols);
        const itemsInThisRow =
          row === rows - 1 ? visibleCount - row * cols : cols;
        const colInRow = idx % cols;

        const centerColOffset = colInRow - (itemsInThisRow - 1) / 2;
        const centerRowOffset = row - (rows - 1) / 2;

        const jitterX = Math.random() * 22 - 11;
        const jitterY = Math.random() * 22 - 11;

        return {
          id: idx,
          x: Math.round(centerColOffset * spacingX + jitterX),
          y: Math.round(centerRowOffset * spacingY + jitterY),
          rotate: Math.floor(Math.random() * 36) - 18,
        };
      });

      setPaperPositions(spreadPositions);
      setStage("spread");
    }, 2100);
  };

  const handlePickPaper = async (index: number) => {
    if (stage !== "spread") return;
    setSelectedPaperIndex(index);
    setStage("unfolding");
    sound.playUnfold();

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      await onPaperOpened();
    } catch (e) {
      console.error("Error in onPaperOpened:", e);
    }

    setTimeout(() => {
      setStage("revealed");
    }, 1100);
  };

  // Scale paper size slightly if there are many participants so all fit comfortably
  const paperSizeClass =
    visibleCount > 12
      ? "w-18 h-15"
      : visibleCount > 9
      ? "w-20 h-16"
      : "w-24 h-20";

  return (
    <div
      className={`min-h-[82vh] w-full max-w-xl mx-auto flex flex-col items-center justify-between p-4 md:p-6 rounded-3xl ${config.tableClass} border-8 ${config.tableBorder} shadow-2xl relative overflow-hidden tartan-pattern`}
    >
      {/* Header */}
      <div className="z-10 text-center bg-[#fdf8f0] px-6 py-4 rounded-2xl border-4 border-[#c83e31] shadow-lg max-w-md w-full">
        <p className="text-xs md:text-sm uppercase tracking-widest text-[#8c583a] font-bold">
          {t.table.turnOf} {participantName} ({visibleCount} 🎟️)
        </p>
        <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#2b1810] mt-1">
          {stage === "ready" && t.table.step1}
          {stage === "shuffling" && t.table.step1Shuffling}
          {stage === "spread" && t.table.step2}
          {stage === "unfolding" && t.table.step2Unfolding}
          {stage === "revealed" && t.table.stepRevealed}
        </h2>
      </div>

      {/* Central Table Area */}
      <div className="relative flex-1 w-full flex items-center justify-center my-6 min-h-[360px]">
        <AnimatePresence>
          {stage !== "revealed" &&
            paperPositions.map((paper, idx) => {
              const isSelected = selectedPaperIndex === idx;
              if (stage === "unfolding" && !isSelected) return null;

              const kf = shuffleKeyframes[idx] || shuffleKeyframes[0];

              return (
                <motion.button
                  type="button"
                  key={paper.id}
                  onClick={() => handlePickPaper(idx)}
                  disabled={stage !== "spread"}
                  initial={{
                    scale: 0.85,
                    x: initialPile[idx]?.x || 0,
                    y: initialPile[idx]?.y || 0,
                    rotate: initialPile[idx]?.rotate || 0,
                  }}
                  animate={
                    stage === "shuffling"
                      ? {
                          x: kf.x,
                          y: kf.y,
                          rotate: kf.rotate,
                          scale: [1, 1.12, 0.96, 1.1, 0.98, 1.06, 1],
                        }
                      : stage === "unfolding" && isSelected
                      ? { x: 0, y: 0, rotate: 0, scale: 2.3, zIndex: 40 }
                      : {
                          x: paper.x,
                          y: paper.y,
                          rotate: paper.rotate,
                          scale: 1,
                        }
                  }
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={
                    stage === "shuffling"
                      ? {
                          duration: 2.05,
                          ease: "easeInOut",
                        }
                      : {
                          type: "spring",
                          stiffness: 180,
                          damping: 16,
                        }
                  }
                  className={`absolute ${paperSizeClass} bg-[#f7eedc] border-2 border-[#d4be98] rounded-lg shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform ${
                    stage === "spread"
                      ? "hover:scale-110 active:scale-95"
                      : ""
                  }`}
                  style={{
                    backgroundImage: config.paperPattern,
                  }}
                >
                  {/* Fold crease lines to look like a real folded paper */}
                  <div className="absolute inset-0 pointer-events-none border-b border-r border-black/10 rounded-lg" />
                  <div className="bg-[#fffdf8] px-2.5 py-1 rounded border border-[#d6be96] shadow-sm">
                    <span className="text-xs font-serif font-black text-[#2b1810]">
                      {stage === "spread" ? t.table.touchMe : config.emoji}
                    </span>
                  </div>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {stage === "revealed" && (
          <UnfoldedPaper
            participantName={participantName}
            assignedTargetName={assignedTargetName}
            budget={budget}
            targetWishlist={targetWishlist}
            initialMyWishlist={initialMyWishlist}
            goldenTicketName={goldenTicketName}
            onSaveWishlist={onSaveWishlist}
            onBackToLobby={onBackToLobby}
          />
        )}
      </div>

      {/* Bottom Action Bar */}
      {stage !== "revealed" && (
        <div className="z-10 w-full max-w-md">
          {stage === "ready" && (
            <button
              type="button"
              onClick={handleShuffle}
              className="w-full py-5 bg-[#2e6b4e] hover:bg-[#23533c] text-white text-xl md:text-2xl font-bold rounded-2xl border-b-4 border-[#163b28] shadow-2xl active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{t.table.shuffleButton}</span>
            </button>
          )}

          {stage === "spread" && (
            <div className="bg-[#fcf8f0] px-4 py-3 rounded-2xl border-2 border-[#c83e31] text-center shadow-md animate-pulse">
              <p className="text-base font-bold text-[#2b1810]">
                {t.table.touchPaperPrompt}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onBackToLobby}
            className="w-full py-2.5 mt-2 text-[#fcf8f0] text-sm font-semibold hover:underline text-center cursor-pointer"
          >
            {t.table.cancelButton}
          </button>
        </div>
      )}
    </div>
  );
}
