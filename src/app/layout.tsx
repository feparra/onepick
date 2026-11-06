import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif-heading",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Papelitos - Amigo Secreto Familiar / Family Secret Santa",
  description:
    "El sorteo de Amigo Secreto más fácil, cálido y nostálgico. Sin contraseñas, sin registros, directo al papelito.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#c83e31",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#2a150c] text-[#2b1810] antialiased flex flex-col justify-between">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
