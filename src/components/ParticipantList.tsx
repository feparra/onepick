"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, UserCheck, Lock, KeyRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface ParticipantItem {
  id: string;
  name: string;
  has_drawn: boolean;
  has_pin?: boolean;
  wishlist_note?: string | null;
  drawn_at?: string | null;
}

interface ParticipantListProps {
  participants: ParticipantItem[];
  savedParticipantId?: string | null;
  savedParticipantName?: string | null;
  onSelectParticipant: (participant: ParticipantItem, pin: string) => void;
  onReopenSaved: () => void;
}

export default function ParticipantList({
  participants,
  savedParticipantId,
  savedParticipantName,
  onSelectParticipant,
  onReopenSaved,
}: ParticipantListProps) {
  const { t } = useLanguage();
  const [candidate, setCandidate] = useState<ParticipantItem | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // PIN modal states
  const [pinModalCandidate, setPinModalCandidate] = useState<ParticipantItem | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [pinConfirmValue, setPinConfirmValue] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const handleCardClick = (p: ParticipantItem) => {
    if (p.has_drawn) {
      if (savedParticipantId === p.id) {
        onReopenSaved();
      } else {
        // Participant has drawn, but user is on another device or without session -> ask for their PIN to reopen!
        setPinModalCandidate(p);
        setPinValue("");
        setPinConfirmValue("");
        setPinError(null);
      }
      return;
    }
    // First confirm name
    setCandidate(p);
  };

  const confirmSelection = () => {
    if (candidate) {
      const selected = candidate;
      setCandidate(null);
      // Open PIN modal
      setPinModalCandidate(selected);
      setPinValue("");
      setPinConfirmValue("");
      setPinError(null);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (pinValue.length !== 4 || !/^\d{4}$/.test(pinValue)) {
      setPinError(t.lobby.pinInvalidLength);
      return;
    }

    if (!pinModalCandidate?.has_pin) {
      // Must confirm PIN when creating it
      if (pinValue !== pinConfirmValue) {
        setPinError(t.lobby.pinMismatch);
        return;
      }
    }

    if (pinModalCandidate) {
      const target = pinModalCandidate;
      const cleanPin = pinValue;
      setPinModalCandidate(null);
      setPinValue("");
      setPinConfirmValue("");
      onSelectParticipant(target, cleanPin);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {/* Banner if already drawn on this device */}
      {savedParticipantId && savedParticipantName && (
        <button
          onClick={onReopenSaved}
          className="w-full bg-[#fdf8ed] border-4 border-[#2e6b4e] hover:bg-[#f5ecda] p-5 rounded-2xl shadow-xl flex items-center justify-between text-left transition-transform active:scale-98 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#2e6b4e] flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#2e6b4e]">
                {t.lobby.savedBannerTitle}
              </p>
              <p className="text-xl font-serif font-black text-[#2b1810]">
                {t.lobby.savedBannerButton} ({savedParticipantName})
              </p>
            </div>
          </div>
          <span className="text-2xl">👉</span>
        </button>
      )}

      {/* Instructional header */}
      <div className="bg-[#fcf7ee] border-2 border-[#d6c4a5] rounded-2xl p-4 text-center shadow-sm">
        <p className="text-lg md:text-xl font-bold text-[#3e2518]">
          {t.lobby.instructionHeader}
        </p>
      </div>

      {/* Participants single-column large cards */}
      <div className="flex flex-col gap-3">
        {participants.map((p) => {
          const isDrawn = p.has_drawn;
          const isMe = savedParticipantId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => handleCardClick(p)}
              className={`w-full min-h-[68px] px-5 py-4 rounded-2xl font-sans text-left transition-all duration-150 flex items-center justify-between shadow-md border-3 active:scale-98 ${
                isDrawn
                  ? "bg-[#e8decb] border-[#baab90] text-[#635445] opacity-85"
                  : "bg-[#fffdf8] hover:bg-[#fff9ed] border-[#2e6b4e] text-[#1c3527] cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                {isDrawn ? (
                  <CheckCircle2 className="w-7 h-7 text-[#2e6b4e] flex-shrink-0" />
                ) : (
                  <span className="text-2xl flex-shrink-0">👉</span>
                )}
                <span className="text-xl md:text-2xl font-bold tracking-tight">
                  {isDrawn ? p.name : `${t.lobby.imPrefix}${p.name}`}
                </span>
              </div>

              <div>
                {isDrawn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-[#d4c3a7] text-[#2c1c11]">
                    {isMe ? t.lobby.yourPaper : t.lobby.alreadyHasPaper}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#2e6b4e] bg-[#eaf4ee] px-3 py-1 rounded-full border border-[#b2d8c3]">
                    {p.has_pin && <Lock className="w-3.5 h-3.5" />}
                    {t.lobby.availableBadge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirmation Anti-Error Modal */}
      {candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fcf8f0] border-4 border-[#c83e31] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-[#fdf0ec] text-[#c83e31] flex items-center justify-center mx-auto mb-4 border-2 border-[#f4c2ba]">
              <UserCheck className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-serif font-black text-[#2b1810] mb-2">
              {t.lobby.confirmModalTitle}
            </h3>

            <p className="text-lg text-[#523728] leading-relaxed mb-6">
              {t.lobby.confirmModalQuestion}{" "}
              <strong className="text-[#c83e31] text-xl font-black">{candidate.name}</strong>?
              <br />
              <span className="text-sm text-[#7a5b48] mt-1 block">
                {t.lobby.confirmModalNote}
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmSelection}
                className="w-full py-4 bg-[#2e6b4e] hover:bg-[#23533c] text-white text-xl font-bold rounded-2xl border-b-4 border-[#163c29] shadow-lg active:translate-y-0.5 transition-all"
              >
                {t.lobby.confirmYes} {candidate.name}
              </button>
              <button
                onClick={() => setCandidate(null)}
                className="w-full py-3 bg-[#e8decb] hover:bg-[#ded1bc] text-[#543d2d] text-lg font-bold rounded-2xl border-b-2 border-[#b5a388] transition-all"
              >
                {t.lobby.confirmNo}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Digit Security PIN Modal */}
      {pinModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fcf8f0] border-4 border-[#2e6b4e] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <div className="w-14 h-14 rounded-full bg-[#eaf5ee] text-[#2e6b4e] flex items-center justify-center mx-auto mb-3 border-2 border-[#9ed6b4]">
              {pinModalCandidate.has_pin ? <Lock className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
            </div>

            <h3 className="text-2xl font-serif font-black text-[#2b1810] mb-2">
              {pinModalCandidate.has_pin ? t.lobby.enterPinTitle : t.lobby.createPinTitle}
            </h3>

            <p className="text-sm text-[#5c3e2e] leading-relaxed mb-4">
              {pinModalCandidate.has_pin
                ? `${t.lobby.enterPinDesc} ${pinModalCandidate.name}:`
                : t.lobby.createPinDesc}
            </p>

            <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                placeholder={t.lobby.pinPlaceholder}
                className="w-full py-3.5 px-4 bg-white border-2 border-[#ccb894] rounded-xl text-center text-2xl font-mono tracking-widest text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                required
              />

              {!pinModalCandidate.has_pin && (
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinConfirmValue}
                  onChange={(e) => setPinConfirmValue(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.lobby.pinConfirmPlaceholder}
                  className="w-full py-3.5 px-4 bg-white border-2 border-[#ccb894] rounded-xl text-center text-2xl font-mono tracking-widest text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                  required
                />
              )}

              {pinError && (
                <div className="p-2.5 bg-[#fdeeed] border border-[#c83e31] rounded-xl text-xs font-bold text-[#a02b1f]">
                  ⚠️ {pinError}
                </div>
              )}

              <button
                type="submit"
                disabled={pinValue.length !== 4}
                className="w-full py-4 bg-[#2e6b4e] hover:bg-[#23533c] disabled:opacity-50 text-white text-lg font-bold rounded-2xl border-b-4 border-[#163c29] shadow-lg active:translate-y-0.5 transition-all mt-1"
              >
                {t.lobby.pinSubmit}
              </button>

              <button
                type="button"
                onClick={() => setPinModalCandidate(null)}
                className="w-full py-2.5 text-[#634937] hover:text-[#2b1810] font-bold text-sm"
              >
                {t.common.cancel}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcf8f0] border-4 border-[#b84a39] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#fdeeed] text-[#b84a39] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-black text-[#2b1810] mb-2">
              {t.lobby.alreadyTakenTitle}
            </h3>
            <p className="text-base text-[#5c3e2e] leading-relaxed mb-6">
              {warningMessage}
            </p>
            <button
              onClick={() => setWarningMessage(null)}
              className="w-full py-3 bg-[#2b1810] text-[#fcf8f0] text-lg font-bold rounded-2xl shadow-md"
            >
              {t.common.understood}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
