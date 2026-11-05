"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, UserCheck } from "lucide-react";

export interface ParticipantItem {
  id: string;
  name: string;
  has_drawn: boolean;
  wishlist_note?: string | null;
  drawn_at?: string | null;
}

interface ParticipantListProps {
  participants: ParticipantItem[];
  savedParticipantId?: string | null;
  savedParticipantName?: string | null;
  onSelectParticipant: (participant: ParticipantItem) => void;
  onReopenSaved: () => void;
}

export default function ParticipantList({
  participants,
  savedParticipantId,
  savedParticipantName,
  onSelectParticipant,
  onReopenSaved,
}: ParticipantListProps) {
  const [candidate, setCandidate] = useState<ParticipantItem | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleCardClick = (p: ParticipantItem) => {
    if (p.has_drawn) {
      if (savedParticipantId === p.id) {
        onReopenSaved();
      } else {
        setWarningMessage(
          `${p.name} ya sacó su papelito. Si eres ${p.name} y cambiaste de celular, pídele ayuda al organizador de la sala.`
        );
      }
      return;
    }
    setCandidate(p);
  };

  const confirmSelection = () => {
    if (candidate) {
      const selected = candidate;
      setCandidate(null);
      onSelectParticipant(selected);
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
                ¡Ya tienes tu papel guardado!
              </p>
              <p className="text-xl font-serif font-black text-[#2b1810]">
                🎟️ Ver mi papelito ({savedParticipantName})
              </p>
            </div>
          </div>
          <span className="text-2xl">👉</span>
        </button>
      )}

      {/* Instructional header for elderly/family */}
      <div className="bg-[#fcf7ee] border-2 border-[#d6c4a5] rounded-2xl p-4 text-center shadow-sm">
        <p className="text-lg md:text-xl font-bold text-[#3e2518]">
          👇 Toca tu nombre en la lista para sacar tu papel:
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
                  {isDrawn ? p.name : `Soy ${p.name}`}
                </span>
              </div>

              <div>
                {isDrawn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-[#d4c3a7] text-[#2c1c11]">
                    {isMe ? "🎟️ Tu papel" : "✅ Ya tiene papel"}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-[#2e6b4e] bg-[#eaf4ee] px-3 py-1 rounded-full border border-[#b2d8c3]">
                    Disponible
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
              ¿Confirmas tu nombre?
            </h3>

            <p className="text-lg text-[#523728] leading-relaxed mb-6">
              ¿Seguro que eres <strong className="text-[#c83e31] text-xl font-black">{candidate.name}</strong>?
              <br />
              <span className="text-sm text-[#7a5b48] mt-1 block">
                Solo debes elegir tu propio nombre para no ver el secreto de otro.
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmSelection}
                className="w-full py-4 bg-[#2e6b4e] hover:bg-[#23533c] text-white text-xl font-bold rounded-2xl border-b-4 border-[#163c29] shadow-lg active:translate-y-0.5 transition-all"
              >
                ✅ Sí, soy {candidate.name}
              </button>
              <button
                onClick={() => setCandidate(null)}
                className="w-full py-3 bg-[#e8decb] hover:bg-[#ded1bc] text-[#543d2d] text-lg font-bold rounded-2xl border-b-2 border-[#b5a388] transition-all"
              >
                ❌ No, me equivoqué
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal when clicking someone else who already drew */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcf8f0] border-4 border-[#b84a39] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#fdeeed] text-[#b84a39] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-black text-[#2b1810] mb-2">
              Papelito ya retirado
            </h3>
            <p className="text-base text-[#5c3e2e] leading-relaxed mb-6">
              {warningMessage}
            </p>
            <button
              onClick={() => setWarningMessage(null)}
              className="w-full py-3 bg-[#2b1810] text-[#fcf8f0] text-lg font-bold rounded-2xl shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
