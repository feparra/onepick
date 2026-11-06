"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft, Share2, Check, Sparkles } from "lucide-react";
import { THEMES, ThemeKey } from "@/components/ThemeProvider";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n";

export default function CrearSalaPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form states
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("christmas_90s");
  const [title, setTitle] = useState("Navidad en Familia");
  const [budget, setBudget] = useState("$30 USD");
  const [eventDate, setEventDate] = useState("24 de Diciembre");
  const [adminPin, setAdminPin] = useState("1234");

  // Participant list state
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([
    "Abuela Rosa",
    "Papá Carlos",
    "Mamá Elena",
  ]);

  // Loading & error & modal state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddParticipant = () => {
    const trimmed = participantInput.trim();
    if (!trimmed) return;
    if (participants.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`"${trimmed}" ya está en la lista.`);
      return;
    }
    setParticipants([...participants, trimmed]);
    setParticipantInput("");
    setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Por favor escribe un nombre para el sorteo.");
      return;
    }

    if (participants.length < 3) {
      setErrorMessage(t.crear.minParticipants);
      return;
    }

    if (!adminPin || adminPin.length !== 4) {
      setErrorMessage(t.crear.adminPinLabel);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          theme: selectedTheme,
          budget,
          eventDate,
          adminPin,
          participantNames: participants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear la sala.");
      }

      setCreatedSlug(data.slug);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const roomUrl =
    typeof window !== "undefined" && createdSlug
      ? `${window.location.origin}/room/${createdSlug}`
      : "";

  const whatsappMessage = encodeURIComponent(
    `🎄 ¡Hola familia! Ya está listo nuestro sorteo de Amigo Secreto ("${title}").\n\n` +
      `👉 Entra a este enlace, busca tu nombre y abre tu papelito:\n${roomUrl}\n\n` +
      `🤫 ¡Recuerda no decirle a nadie quién te tocó!`
  );

  const handleCopyLink = () => {
    if (!roomUrl) return;
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#2a150c] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Top return navigation & Language Switcher */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#e4cdbd] hover:text-white font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t.common.backHome}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-xs uppercase font-bold tracking-wider text-[#d29b72]">
              {t.crear.stepHost}
            </span>
          </div>
        </div>

        {/* Creation Card */}
        <div className="bg-[#fcf8f0] rounded-3xl p-6 md:p-8 border-4 border-[#c83e31] shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif font-black text-[#2b1810]">
              {t.crear.heading}
            </h1>
            <p className="text-sm text-[#664b38] mt-1">
              {t.crear.subheading}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 1. Theme selector */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#543b2b] mb-2">
                {t.crear.step1}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
                  const th = THEMES[key];
                  const isSelected = selectedTheme === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className={`p-3 rounded-2xl border-3 text-left transition-all ${
                        isSelected
                          ? "bg-[#f5e6ce] border-[#c83e31] shadow-md scale-102"
                          : "bg-white border-[#d8c5a8] hover:bg-[#faf4ec]"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{th.emoji}</span>
                      <p className="text-xs md:text-sm font-bold text-[#2b1810] leading-tight">
                        {th.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Group details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#3d2618] mb-1">
                  {t.crear.step2}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.crear.titlePlaceholder}
                  className="w-full px-4 py-3 bg-white border-2 border-[#ccb894] rounded-xl text-lg font-bold text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c3e2b] mb-1">
                    {t.crear.budgetLabel}
                  </label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t.crear.budgetPlaceholder}
                    className="w-full px-3 py-2.5 bg-white border-2 border-[#ccb894] rounded-xl text-sm font-semibold text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c3e2b] mb-1">
                    {t.crear.dateLabel}
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder={t.crear.datePlaceholder}
                    className="w-full px-3 py-2.5 bg-white border-2 border-[#ccb894] rounded-xl text-sm font-semibold text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Participants management */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-[#3d2618]">
                  {t.crear.participantsLabel} ({participants.length}):
                </label>
                <span className="text-xs text-[#825c42] font-semibold">
                  {t.crear.minParticipants}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.crear.participantInputPlaceholder}
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#ccb894] rounded-xl text-base font-bold text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-5 bg-[#2e6b4e] hover:bg-[#23533c] text-white font-bold rounded-xl flex items-center justify-center text-xl shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-[#f0e4cf] rounded-2xl border border-[#d6c4a5]">
                {participants.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fffefc] border border-[#cfbd9f] rounded-full text-sm font-bold text-[#2b1810] shadow-xs"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className="w-5 h-5 rounded-full hover:bg-[#e8d5bc] flex items-center justify-center text-[#802a20]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Admin PIN */}
            <div>
              <label className="block text-xs font-bold text-[#5c3e2b] mb-1">
                {t.crear.adminPinLabel}
              </label>
              <input
                type="password"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-32 px-3 py-2 bg-white border-2 border-[#ccb894] rounded-xl text-center text-lg font-mono tracking-widest text-[#2b1810] focus:outline-none focus:border-[#2e6b4e]"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#fdeeed] border-2 border-[#c83e31] rounded-xl text-xs md:text-sm font-bold text-[#a02b1f]">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLoading || participants.length < 3}
              className="w-full py-5 bg-[#c83e31] hover:bg-[#b03226] disabled:opacity-50 text-white text-xl font-bold rounded-2xl border-b-4 border-[#822118] shadow-xl flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
              <span>
                {isLoading ? t.crear.submittingButton : t.crear.submitButton}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {createdSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffef7] border-6 border-[#2e6b4e] rounded-3xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-[#eaf5ee] text-[#2e6b4e] flex items-center justify-center mx-auto mb-3 border-2 border-[#9ed6b4]">
              <Sparkles className="w-9 h-9" />
            </div>

            <h3 className="text-3xl font-serif font-black text-[#2b1810] mb-2">
              {t.crear.modalTitle}
            </h3>

            <p className="text-sm md:text-base text-[#5c3e2e] leading-relaxed mb-6">
              {t.crear.modalDesc}
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 px-6 bg-[#25D366] hover:bg-[#1fb858] text-white text-xl font-bold rounded-2xl border-b-4 border-[#128C7E] shadow-xl flex items-center justify-center gap-3 active:translate-y-1 transition-all"
              >
                <Share2 className="w-7 h-7" />
                <span>{t.crear.whatsappButton}</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="w-full py-3.5 bg-[#f5ecda] hover:bg-[#ebdcc4] text-[#422919] font-bold rounded-xl border border-[#c4ae8c] flex items-center justify-center gap-2 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-5 h-5 text-[#2e6b4e]" />
                    <span>{t.crear.linkCopied}</span>
                  </>
                ) : (
                  <span>{t.crear.copyLinkButton}</span>
                )}
              </button>

              <button
                onClick={() => router.push(`/room/${createdSlug}`)}
                className="w-full py-4 bg-[#2b1810] hover:bg-[#1a0e09] text-white text-lg font-bold rounded-2xl shadow-md mt-2"
              >
                {t.crear.goToRoomButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
