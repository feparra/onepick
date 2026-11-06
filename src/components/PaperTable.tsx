"use client";

import React, { useState } from "react";
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
  onPaperOpened: () => Promise<void>;
  onSaveWishlist?: (note: string) => Promise<void>;
  onBackToLobby: () => void;
}

export default function PaperTable({
  participantName,
  assignedTargetName,
  totalPapers,
  budget,
  targetWishlist,
  initialMyWishlist,
  onPaperOpened,
  onSaveWishlist,
  onBackToLobby,
}: PaperTableProps) {
  const { config } = useTheme();
  const { t } = useLanguage();
  const [stage, setStage] = useState<"ready" | "shuffling" | "spread" | "unfolding" | "revealed">("ready");
  const [selectedPaperIndex, setSelectedPaperIndex] = useState<number | null>(null);

  const visibleCount = Math.min(Math.max(totalPapers, 6), 12);
  const [paperPositions, setPaperPositions] = useState(
    Array.from({ length: visibleCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      rotate: (i % 2 === 0 ? 1 : -1) * (i * 6),
    }))
  );

  const handleShuffle = () => {
    setStage("shuffling");
    sound.playShuffle();

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 60, 40, 80]);
    }

    setTimeout(() => {
      const spreadPositions = paperPositions.map((p, idx) => {
        const col = (idx % 3) - 1;
        const row = Math.floor(idx / 3) - 1;
        return {
          id: p.id,
          x: col * 95 + (Math.random() * 30 - 15),
          y: row * 85 + (Math.random() * 30 - 15),
          rotate: Math.floor(Math.random() * 44) - 22,
        };
      });
      setPaperPositions(spreadPositions);
      setStage("spread");
    }, 1600);
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

  return (
    <div
      className={`min-h-[82vh] w-full max-w-xl mx-auto flex flex-col items-center justify-between p-4 md:p-6 rounded-3xl ${config.tableClass} border-8 ${config.tableBorder} shadow-2xl relative overflow-hidden tartan-pattern`}
    >
      {/* Header */}
      <div className="z-10 text-center bg-[#fdf8f0] px-6 py-4 rounded-2xl border-4 border-[#c83e31] shadow-lg max-w-md w-full">
        <p className="text-xs md:text-sm uppercase tracking-widest text-[#8c583a] font-bold">
          {t.table.turnOf} {participantName}
        </p>
        <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#2b1810] mt-1">
          {stage === "ready" && t.table.step1}
          {stage === "shuffling" && t.table.step1Shuffling}
          {stage === "spread" && t.table.step2}
          {stage === "unfolding" && t.table.step2Unfolding}
          {stage === "revealed" && t.table.stepRevealed}
        </h2>
      </div>

      {/* Central Area */}
      <div className="relative flex-1 w-full flex items-center justify-center my-6 min-h-[340px]">
        <AnimatePresence>
          {stage !== "revealed" &&
            paperPositions.map((paper, idx) => {
              const isSelected = selectedPaperIndex === idx;
              if (stage === "unfolding" && !isSelected) return null;

              return (
                <motion.button
                  key={paper.id}
                  onClick={() => handlePickPaper(idx)}
                  disabled={stage !== "spread"}
                  initial={{ scale: 0.8, x: 0, y: 0 }}
                  animate={
                    stage === "shuffling"
                      ? {
                          x: [0, idx % 2 ? 50 : -50, idx % 3 ? -40 : 40, 0],
                          y: [0, idx % 3 ? -50 : 50, idx % 2 ? 40 : -40, 0],
                          rotate: [0, 180, -180, 360],
                          scale: 1.08,
                        }
                      : stage === "unfolding" && isSelected
                      ? { x: 0, y: 0, rotate: 0, scale: 2.3 }
                      : { x: paper.x, y: paper.y, rotate: paper.rotate, scale: 1 }
                  }
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{
                    duration: stage === "shuffling" ? 1.5 : 0.6,
                    type: "spring",
                  }}
                  className={`absolute w-24 h-20 bg-[#f7eedc] border-2 border-[#d4be98] rounded-lg shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform ${
                    stage === "spread" ? "hover:scale-105 active:scale-95 animate-bounce-subtle" : ""
                  }`}
                  style={{
                    backgroundImage: config.paperPattern,
                  }}
                >
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
            onSaveWishlist={onSaveWishlist}
            onBackToLobby={onBackToLobby}
          />
        )}
      </div>

      {/* Bottom Button */}
      {stage !== "revealed" && (
        <div className="z-10 w-full max-w-md">
          {stage === "ready" && (
            <button
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
            onClick={onBackToLobby}
            className="w-full py-2.5 mt-2 text-[#fcf8f0] text-sm font-semibold hover:underline text-center"
          >
            {t.table.cancelButton}
          </button>
        </div>
      )}
    </div>
  );
}
