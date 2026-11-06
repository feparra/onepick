"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeKey } from "@/components/ThemeProvider";

export type Language = "es" | "en";

export interface Translations {
  common: {
    backHome: string;
    loading: string;
    error: string;
    cancel: string;
    confirm: string;
    understood: string;
    footerText: string;
    madeForFamilies: string;
    save: string;
    saving: string;
    roomNotFound: string;
    roomNotFoundDesc: string;
  };
  themes: Record<
    ThemeKey,
    {
      name: string;
      tagline: string;
    }
  >;
  home: {
    ribbon: string;
    title: string;
    subtitle: string;
    zeroFrictionTitle: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
    createButton: string;
    badgeSecret: string;
    badgeSecretDesc: string;
    badgeEveryone: string;
    badgeEveryoneDesc: string;
  };
  crear: {
    stepHost: string;
    heading: string;
    subheading: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    budgetLabel: string;
    dateLabel: string;
    participantsLabel: string;
    minParticipants: string;
    emptyParticipantsHint: string;
    duplicateParticipantError: string;
    missingTitleError: string;
    adminPinLabel: string;
    goldenToggleButton: string;
    goldenActiveTitle: string;
    goldenCheckboxLabel: string;
    goldenNameLabel: string;
    goldenHelper: string;
    submitButton: string;
    submittingButton: string;
    modalTitle: string;
    modalDesc: string;
    whatsappButton: string;
    whatsappTemplate: (title: string, url: string) => string;
    copyLinkButton: string;
    linkCopied: string;
    goToRoomButton: string;
  };
  lobby: {
    subtitle: string;
    budget: string;
    date: string;
    savedBannerTitle: string;
    savedBannerButton: string;
    instructionHeader: string;
    imPrefix: string;
    alreadyHasPaper: string;
    yourPaper: string;
    availableBadge: string;
    confirmModalTitle: string;
    confirmModalQuestion: string;
    confirmModalNote: string;
    confirmYes: string;
    confirmNo: string;
    alreadyTakenTitle: string;
    alreadyTakenDesc: string;
    createPinTitle: string;
    createPinDesc: string;
    enterPinTitle: string;
    enterPinDesc: string;
    pinLabel: string;
    pinConfirmLabel: string;
    pinMismatch: string;
    pinInvalidLength: string;
    pinIncorrect: string;
    pinSubmit: string;
  };
  table: {
    turnOf: string;
    step1: string;
    step1Shuffling: string;
    step2: string;
    step2Unfolding: string;
    stepRevealed: string;
    shuffleButton: string;
    touchPaperPrompt: string;
    touchMe: string;
    cancelButton: string;
  };
  unfolded: {
    cornerRibbon: string;
    paperOf: string;
    secretIs: string;
    budgetSuggested: string;
    clueFrom: string;
    familySecretNote: string;
    goldenBadge: string;
    goldenTitle: string;
    goldenDecree: string;
    goldenFooter: string;
    savePhotoButton: string;
    savingPhoto: string;
    wishlistQuestion: string;
    wishlistSub: string;
    saveWishlistButton: string;
    wishlistSaved: string;
    backToList: string;
  };
}

const dictionaries: Record<Language, Translations> = {
  es: {
    common: {
      backHome: "Volver al inicio",
      loading: "Cargando...",
      error: "Error inesperado",
      cancel: "Cancelar",
      confirm: "Confirmar",
      understood: "Entendido",
      footerText: "Papelitos — Proyecto Open Source para la familia.",
      madeForFamilies: "Papelitos — Desarrollado para familias de todas las edades",
      save: "Guardar",
      saving: "Guardando...",
      roomNotFound: "Sala no encontrada",
      roomNotFoundDesc: "El enlace no corresponde a ninguna sala activa.",
    },
    themes: {
      christmas_90s: {
        name: "Navidad en Familia (90s)",
        tagline: "Mantel escocés rojo y pino cálido",
      },
      amor_amistad: {
        name: "Amor y Amistad",
        tagline: "Madera suave, rosa vintage y terracota",
      },
      reyes_magos: {
        name: "Día de Reyes",
        tagline: "Azul medianoche y destellos dorados",
      },
      custom_party: {
        name: "Fiesta & Celebración",
        tagline: "Confeti noventero y colores pastel",
      },
    },
    home: {
      ribbon: "Motor Nostálgico de Amigo Secreto",
      title: "Papelitos 🎄",
      subtitle: "El sorteo de toda la vida, ahora en el celular y sin enredos para la familia.",
      zeroFrictionTitle: "¡Cero Fricción!",
      benefit1: "Sin correos ni contraseñas.",
      benefit2: "No hay que descargar aplicaciones.",
      benefit3: "Letra gigante y fácil para los abuelos.",
      benefit4: "Se comparte por WhatsApp con 1 toque.",
      createButton: "✨ Crear Sorteo Familiar",
      badgeSecret: "100% Secreto",
      badgeSecretDesc: "Algoritmo circular: nadie se saca a sí mismo.",
      badgeEveryone: "Para Todos",
      badgeEveryoneDesc: "Diseñado con amor y nostalgia de los años 90s.",
    },
    crear: {
      stepHost: "Paso del Anfitrión",
      heading: "Crear Nuevo Sorteo",
      subheading: "Configura la mesa en 1 minuto para toda la familia.",
      step1: "1. Elige la Festividad:",
      step2: "2. Nombre del Sorteo o Familia:",
      step3: "3. Participantes",
      step4: "4. PIN del Anfitrión (4 dígitos):",
      budgetLabel: "Presupuesto:",
      dateLabel: "Fecha del Evento:",
      participantsLabel: "Participantes",
      minParticipants: "Mínimo 3 personas",
      emptyParticipantsHint: "Aún no has agregado participantes. Escribe cada nombre arriba y presiona (+).",
      duplicateParticipantError: "Ese nombre ya está en la lista.",
      missingTitleError: "Por favor escribe un nombre para el sorteo.",
      adminPinLabel: "PIN de 4 dígitos del Anfitrión:",
      goldenToggleButton: "👑 Modo Especial: Papelito Dorado",
      goldenActiveTitle: "✨ Papelito Dorado VIP (Sorpresa Familiar)",
      goldenCheckboxLabel: "Hacer que a TODOS les salga un 2do papelito dorado obligatorio",
      goldenNameLabel: "Nombre del homenajeado / bebé:",
      goldenHelper: "Al abrir su papel normal, a cada participante le saldrá también un Papelito Dorado sorpresa anunciando que su segundo Amigo Secreto obligatorio es esta persona.",
      submitButton: "Crear Mesa y Revolver Papelitos",
      submittingButton: "Revolviendo y organizando...",
      modalTitle: "¡Mesa Creada! 🎄",
      modalDesc: "Los papelitos ya están asignados matemáticamente sin fallos. Ahora solo envía este enlace al grupo familiar:",
      whatsappButton: "📲 Enviar a WhatsApp",
      whatsappTemplate: (title: string, url: string) =>
        `🎄 ¡Hola familia! Ya está listo nuestro sorteo de Amigo Secreto ("${title}").\n\n👉 Entra a este enlace, busca tu nombre y abre tu papelito:\n${url}\n\n🤫 ¡Recuerda no decirle a nadie quién te tocó!`,
      copyLinkButton: "📋 Copiar enlace de la sala",
      linkCopied: "¡Enlace copiado al portapapeles!",
      goToRoomButton: "👉 Ir a la Sala de Papelitos",
    },
    lobby: {
      subtitle: "Amigo Secreto Familiar",
      budget: "Presupuesto:",
      date: "Fecha:",
      savedBannerTitle: "¡Ya tienes tu papel guardado!",
      savedBannerButton: "🎟️ Ver mi papelito",
      instructionHeader: "👇 Toca tu nombre en la lista para sacar tu papel:",
      imPrefix: "Soy ",
      alreadyHasPaper: "✅ Ya tiene papel",
      yourPaper: "🎟️ Tu papel",
      availableBadge: "Disponible",
      confirmModalTitle: "¿Confirmas tu nombre?",
      confirmModalQuestion: "¿Seguro que eres",
      confirmModalNote: "Solo debes elegir tu propio nombre para no ver el secreto de otro.",
      confirmYes: "✅ Sí, soy",
      confirmNo: "❌ No, me equivoqué",
      alreadyTakenTitle: "Papelito ya retirado",
      alreadyTakenDesc: "ya sacó su papelito. Si eres tú y cambiaste de celular, ingresa con tu PIN.",
      createPinTitle: "Crea tu PIN de seguridad (4 dígitos)",
      createPinDesc: "Elige 4 números que recuerdes. Este PIN garantizará que nadie más pueda ver tu papelito.",
      enterPinTitle: "Ingresa tu PIN de 4 dígitos",
      enterPinDesc: "Para proteger tu privacidad, ingresa el PIN de 4 dígitos de",
      pinLabel: "PIN de 4 dígitos:",
      pinConfirmLabel: "Confirmar PIN:",
      pinMismatch: "Los 4 números del PIN no coinciden.",
      pinInvalidLength: "El PIN debe tener exactamente 4 dígitos.",
      pinIncorrect: "El PIN ingresado es incorrecto.",
      pinSubmit: "Continuar a mi papelito",
    },
    table: {
      turnOf: "Turno de",
      step1: "Paso 1: Revuelve los papelitos en la mesa",
      step1Shuffling: "¡Revolviendo bien los papelitos...!",
      step2: "Paso 2: Toca UN papelito para abrirlo",
      step2Unfolding: "Abriendo tu papelito doblado...",
      stepRevealed: "¡Amigo secreto revelado!",
      shuffleButton: "🎲 Revolver los Papelitos",
      touchPaperPrompt: "👆 Toca cualquiera de los papelitos de arriba",
      touchMe: "Tócame",
      cancelButton: "⬅️ Cancelar y volver a la lista",
    },
    unfolded: {
      cornerRibbon: "Secreto",
      paperOf: "Papelito de",
      secretIs: "🤫 Tu amigo secreto es:",
      budgetSuggested: "💰 Presupuesto sugerido:",
      clueFrom: "Pista dejada por",
      familySecretNote: "¡No se lo digas a nadie de la familia! Guárdalo bien en tu memoria o toma una foto.",
      goldenBadge: "👑 DECRETO REAL FAMILIAR",
      goldenTitle: "¡PAPELITO DORADO SORPRESA!",
      goldenDecree: "Por ley oficial de la familia, tu 2do (¡y más importante!) Amigo Secreto obligatorio es:",
      goldenFooter: "🍼 ¡El rey de la fiesta! Nadie se salva de traerle su regalo especial 🎁",
      savePhotoButton: "📸 Guardar Foto de mi Papelito",
      savingPhoto: "Guardando foto...",
      wishlistQuestion: "🎁 ¿Qué te gustaría que te regalen a ti?",
      wishlistSub: "Escribe una pequeña pista para quien te sacó a ti:",
      saveWishlistButton: "Guardar mi pista",
      wishlistSaved: "¡Pista guardada con éxito!",
      backToList: "⬅️ Volver a la lista de la familia",
    },
  },
  en: {
    common: {
      backHome: "Back to Home",
      loading: "Loading...",
      error: "Unexpected error",
      cancel: "Cancel",
      confirm: "Confirm",
      understood: "Understood",
      footerText: "Papelitos — Open Source project for families.",
      madeForFamilies: "Papelitos — Designed for families of all ages",
      save: "Save",
      saving: "Saving...",
      roomNotFound: "Room not found",
      roomNotFoundDesc: "This link does not match any active room.",
    },
    themes: {
      christmas_90s: {
        name: "Family Christmas (90s)",
        tagline: "Red tartan plaid & warm pine wood",
      },
      amor_amistad: {
        name: "Valentine's & Friendship",
        tagline: "Soft wood, vintage rose & terracotta",
      },
      reyes_magos: {
        name: "Three Kings Day / Epiphany",
        tagline: "Starry midnight blue & gold trim",
      },
      custom_party: {
        name: "Party & Celebration",
        tagline: "90s retro confetti & warm pastels",
      },
    },
    home: {
      ribbon: "Nostalgic Secret Santa Engine",
      title: "Papelitos 🎄",
      subtitle: "The timeless holiday gift exchange, now on your phone with zero hassle.",
      zeroFrictionTitle: "Zero Friction!",
      benefit1: "No emails, no passwords.",
      benefit2: "No need to download apps.",
      benefit3: "Extra-large text for grandparents.",
      benefit4: "Share to WhatsApp with 1 tap.",
      createButton: "✨ Create Family Exchange",
      badgeSecret: "100% Secret",
      badgeSecretDesc: "Circular algorithm: no one draws themselves.",
      badgeEveryone: "For Everyone",
      badgeEveryoneDesc: "Built with love and 90s holiday nostalgia.",
    },
    crear: {
      stepHost: "Host Setup",
      heading: "Create New Exchange",
      subheading: "Set up the table in 1 minute for the whole family.",
      step1: "1. Choose Holiday Theme:",
      step2: "2. Name of Exchange or Family:",
      step3: "3. Participants",
      step4: "4. Host PIN (4 digits):",
      budgetLabel: "Budget:",
      dateLabel: "Event Date:",
      participantsLabel: "Participants",
      minParticipants: "Minimum 3 people",
      emptyParticipantsHint: "No participants added yet. Type each name above and press (+).",
      duplicateParticipantError: "That name is already on the list.",
      missingTitleError: "Please enter a name for the exchange.",
      adminPinLabel: "Host 4-digit PIN:",
      goldenToggleButton: "👑 Special Mode: Golden Ticket",
      goldenActiveTitle: "✨ VIP Golden Ticket (Family Surprise)",
      goldenCheckboxLabel: "Give EVERYONE a mandatory 2nd Golden Ticket",
      goldenNameLabel: "Honoree / Baby's Name:",
      goldenHelper: "After opening their normal paper, every participant will also get a surprise Golden Ticket announcing their mandatory 2nd Secret Santa is this special person!",
      submitButton: "Set Table & Shuffle Papers",
      submittingButton: "Shuffling and organizing...",
      modalTitle: "Table Created! 🎄",
      modalDesc: "Secret papers are mathematically assigned with zero flaws. Now share this link with your family group:",
      whatsappButton: "📲 Share on WhatsApp",
      whatsappTemplate: (title: string, url: string) =>
        `🎄 Hi family! Our Secret Santa exchange ("${title}") is ready!\n\n👉 Tap this link, pick your name, and unfold your secret paper:\n${url}\n\n🤫 Remember to keep it a secret!`,
      copyLinkButton: "📋 Copy room link",
      linkCopied: "Link copied to clipboard!",
      goToRoomButton: "👉 Go to Exchange Room",
    },
    lobby: {
      subtitle: "Family Secret Santa",
      budget: "Budget:",
      date: "Date:",
      savedBannerTitle: "Your paper is already saved!",
      savedBannerButton: "🎟️ View my paper",
      instructionHeader: "👇 Tap your name in the list to draw your paper:",
      imPrefix: "I am ",
      alreadyHasPaper: "✅ Has drawn",
      yourPaper: "🎟️ Your paper",
      availableBadge: "Available",
      confirmModalTitle: "Confirm your name",
      confirmModalQuestion: "Are you sure you are",
      confirmModalNote: "Please pick only your own name to keep everyone's secret safe.",
      confirmYes: "✅ Yes, I am",
      confirmNo: "❌ No, go back",
      alreadyTakenTitle: "Paper already picked",
      alreadyTakenDesc: "has already drawn their paper. If this is you on another phone, enter your PIN.",
      createPinTitle: "Create your Security PIN (4 digits)",
      createPinDesc: "Choose 4 digits you will remember. This PIN protects your paper so no one else can open it.",
      enterPinTitle: "Enter your 4-digit PIN",
      enterPinDesc: "To protect your privacy, enter the 4-digit PIN set for",
      pinLabel: "4-digit PIN:",
      pinConfirmLabel: "Confirm PIN:",
      pinMismatch: "The 4-digit PINs do not match.",
      pinInvalidLength: "PIN must be exactly 4 digits.",
      pinIncorrect: "Incorrect PIN entered.",
      pinSubmit: "Proceed to my paper",
    },
    table: {
      turnOf: "Turn of",
      step1: "Step 1: Shuffle the papers on the table",
      step1Shuffling: "Shuffling the papers thoroughly...!",
      step2: "Step 2: Tap ONE paper to open it",
      step2Unfolding: "Unfolding your secret paper...",
      stepRevealed: "Secret Santa Revealed!",
      shuffleButton: "🎲 Shuffle the Papers",
      touchPaperPrompt: "👆 Tap any paper above",
      touchMe: "Pick me",
      cancelButton: "⬅️ Cancel and go back to list",
    },
    unfolded: {
      cornerRibbon: "Secret",
      paperOf: "Paper of",
      secretIs: "🤫 Your Secret Santa recipient is:",
      budgetSuggested: "💰 Suggested budget:",
      clueFrom: "Clue left by",
      familySecretNote: "Don't tell anyone in the family! Keep it in mind or save a photo.",
      goldenBadge: "👑 OFFICIAL FAMILY DECREE",
      goldenTitle: "SURPRISE GOLDEN TICKET!",
      goldenDecree: "By official family law, your 2nd (and MOST IMPORTANT!) mandatory Secret Santa is:",
      goldenFooter: "🍼 The boss of the holidays! Nobody gets a pass on bringing their special gift 🎁",
      savePhotoButton: "📸 Save Photo of My Paper",
      savingPhoto: "Saving photo...",
      wishlistQuestion: "🎁 What would you like as a gift?",
      wishlistSub: "Write a small hint for whoever drew you:",
      saveWishlistButton: "Save my hint",
      wishlistSaved: "Hint saved successfully!",
      backToList: "⬅️ Back to family list",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  t: dictionaries.es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("papelitos_lang") as Language | null;
      if (saved && (saved === "es" || saved === "en")) {
        setLanguageState(saved);
      } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("en")) {
          setLanguageState("en");
        }
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("papelitos_lang", lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language] || dictionaries.es,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 bg-[#3d2013] p-1 rounded-xl border border-[#6b3c26] shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          language === "es"
            ? "bg-[#c83e31] text-white shadow-xs"
            : "text-[#debfa8] hover:text-white"
        }`}
        title="Español"
      >
        🇪🇸 ES
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          language === "en"
            ? "bg-[#c83e31] text-white shadow-xs"
            : "text-[#debfa8] hover:text-white"
        }`}
        title="English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
