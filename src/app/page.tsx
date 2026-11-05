import Link from "next/link";
import { Sparkles, HeartHandshake, ShieldCheck, Gift } from "lucide-react";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#2a150c] flex flex-col items-center justify-between p-4 md:p-8">
      {/* Top Nostalgic Ribbon */}
      <header className="w-full max-w-xl text-center pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdf7ee] border-2 border-[#d2be97] text-[#824e2d] text-xs md:text-sm font-bold shadow-md uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-[#c83e31]" />
          Motor Nostálgico de Amigo Secreto
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-[#fdf8f0] tracking-tight drop-shadow-md">
          Papelitos 🎄
        </h1>
        <p className="text-lg md:text-xl text-[#e6cbba] font-medium mt-2 max-w-md mx-auto">
          El sorteo de toda la vida, ahora en el celular y sin enredos para la familia.
        </p>
      </header>

      {/* Hero Visual Card simulating dining table and paper */}
      <div className="w-full max-w-md my-6 bg-[#fdfbf6] rounded-3xl p-6 md:p-8 border-6 border-[#c83e31] shadow-2xl relative overflow-hidden tartan-pattern">
        <div className="bg-[#fffdf8] p-6 rounded-2xl border-4 border-[#2e6b4e] shadow-xl text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-[#edf6f1] text-[#2e6b4e] flex items-center justify-center mx-auto mb-4 border-2 border-[#a9d8bd] shadow-sm">
            <Gift className="w-9 h-9" />
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#2b1810] mb-3">
            ¡Cero Fricción!
          </h2>

          <ul className="text-left text-sm md:text-base text-[#573d2d] space-y-2.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-lg">🚫</span>
              <span><strong>Sin correos ni contraseñas.</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span><strong>No hay que descargar aplicaciones.</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">👴👵</span>
              <span><strong>Letra gigante y fácil para los abuelos.</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span><strong>Se comparte por WhatsApp con 1 toque.</strong></span>
            </li>
          </ul>

          <Link
            href="/crear"
            className="w-full py-5 px-6 bg-[#2e6b4e] hover:bg-[#23533c] text-white text-xl md:text-2xl font-bold rounded-2xl border-b-4 border-[#163a28] shadow-xl flex items-center justify-center gap-3 active:translate-y-1 transition-all"
          >
            <span>✨ Crear Sorteo Familiar</span>
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <footer className="w-full max-w-md text-center pb-6">
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-[#3a1d10] border border-[#522917] rounded-xl text-[#ded0c3]">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-[#e6a877] mb-1">
              <ShieldCheck className="w-4 h-4" /> 100% Secreto
            </div>
            <p className="text-xs text-[#c4b1a2]">
              Algoritmo circular: nadie se saca a sí mismo.
            </p>
          </div>

          <div className="p-3 bg-[#3a1d10] border border-[#522917] rounded-xl text-[#ded0c3]">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-[#e6a877] mb-1">
              <HeartHandshake className="w-4 h-4" /> Para Todos
            </div>
            <p className="text-xs text-[#c4b1a2]">
              Diseñado con amor y nostalgia de los años 90s.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#9c7863] mt-6">
          Papelitos — Proyecto Open Source para la familia.
        </p>
      </footer>
    </main>
  );
}
