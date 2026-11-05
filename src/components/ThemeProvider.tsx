"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeKey = "christmas_90s" | "amor_amistad" | "reyes_magos" | "custom_party";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  emoji: string;
  tagline: string;
  tableClass: string;
  tableBorder: string;
  accentBg: string;
  accentText: string;
  paperPattern: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  christmas_90s: {
    key: "christmas_90s",
    name: "Navidad en Familia (90s)",
    emoji: "🎄",
    tagline: "Mantel escocés rojo y pino cálido",
    tableClass: "bg-[#451e11]",
    tableBorder: "border-[#2b1008]",
    accentBg: "bg-[#c83e31]",
    accentText: "text-[#c83e31]",
    paperPattern: "repeating-linear-gradient(45deg, #c83e31 0px, #c83e31 6px, #fdf8f0 6px, #fdf8f0 16px, #2e6b4e 16px, #2e6b4e 22px, #fdf8f0 22px, #fdf8f0 32px)",
  },
  amor_amistad: {
    key: "amor_amistad",
    name: "Amor y Amistad",
    emoji: "💌",
    tagline: "Madera suave, rosa vintage y terracota",
    tableClass: "bg-[#42222a]",
    tableBorder: "border-[#271318]",
    accentBg: "bg-[#b84a62]",
    accentText: "text-[#b84a62]",
    paperPattern: "repeating-linear-gradient(45deg, #e8a598 0px, #e8a598 6px, #fff8f5 6px, #fff8f5 18px, #b84a62 18px, #b84a62 24px, #fff8f5 24px, #fff8f5 36px)",
  },
  reyes_magos: {
    key: "reyes_magos",
    name: "Día de Reyes",
    emoji: "👑",
    tagline: "Azul medianoche y destellos dorados",
    tableClass: "bg-[#0f1d38]",
    tableBorder: "border-[#081020]",
    accentBg: "bg-[#d4a017]",
    accentText: "text-[#d4a017]",
    paperPattern: "repeating-linear-gradient(45deg, #d4a017 0px, #d4a017 6px, #0f1d38 6px, #0f1d38 18px, #3a6073 18px, #3a6073 24px, #0f1d38 24px, #0f1d38 36px)",
  },
  custom_party: {
    key: "custom_party",
    name: "Fiesta & Oficina (Retro Memphis)",
    emoji: "🎉",
    tagline: "Confeti noventero y colores pastel",
    tableClass: "bg-[#273238]",
    tableBorder: "border-[#141a1d]",
    accentBg: "bg-[#e26d5c]",
    accentText: "text-[#e26d5c]",
    paperPattern: "repeating-linear-gradient(45deg, #5c9ead 0px, #5c9ead 6px, #fffef9 6px, #fffef9 18px, #e26d5c 18px, #e26d5c 24px, #fffef9 24px, #fffef9 36px)",
  },
};

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "christmas_90s",
  setTheme: () => {},
  config: THEMES.christmas_90s,
});

export function ThemeProvider({
  children,
  initialTheme = "christmas_90s",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeKey;
}) {
  const [theme, setTheme] = useState<ThemeKey>(initialTheme);

  useEffect(() => {
    if (initialTheme && THEMES[initialTheme]) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);

  const config = THEMES[theme] || THEMES.christmas_90s;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      <div data-theme={theme} className="w-full min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
