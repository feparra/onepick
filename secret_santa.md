# SPECIFICATION DOCUMENT: "PAPELITOS" — Motor Nostálgico de Amigo Secreto & Festividades (PWA)

## 1. Visión del Producto y Principios de UX
Construir una Progressive Web App (PWA) ultra-accesible, mobile-first, para sorteos de "Amigo Secreto / Secret Santa" y otras festividades.
- **Target Principal:** Familias multigeneracionales, incluyendo adultos mayores con baja alfabetización digital.
- **Regla de Oro de Fricción Cero:** PROHIBIDO pedir registro de email, contraseñas o descargas de tiendas de aplicaciones. Todo funciona mediante un enlace único (`/room/[slug]`).
- **Estética Visual ("90s Family Nostalgia"):** Evocar las reuniones familiares de los años 90. Texturas cálidas de madera de mesa de comedor, papel kraft, envolturas de regalo clásicas con patrones retro, tipografías serif cálidas combinadas con botones grandes de alto contraste y bordes táctiles claros.

---

## 2. Stack Tecnológico (Optimizado para Vercel)
- **Framework:** Next.js 14+ (App Router) con TypeScript.
- **Estilos:** Tailwind CSS + CSS Variables dinámicas para los temas por festividad.
- **Animaciones (Crítico):** `Framer Motion` (para la física de barajar los papelitos, lanzarlos a la mesa y el desdoble 3D del papel) + `canvas-confetti`.
- **Iconografía:** `Lucide React` (tamaños grandes `w-7 h-7` mínimo para accesibilidad).
- **Base de Datos & Realtime:** Supabase (PostgreSQL). Sincroniza instantáneamente cuando alguien toma su papel.
- **Audio & Háptica:** Web Audio API / HTML5 Audio para sonidos de papel doblándose (`paper-shuffle.mp3`, `paper-unfold.mp3`) y `navigator.vibrate()` en móviles.

---

## 3. Sistema de Temas Dinámicos (Festividades)
Al crear una sala, el Anfitrión elige la festividad. Esto inyecta un atributo `data-theme` en el contenedor raíz de la sala que transforma colores, texturas de la mesa y diseño del dorso de los papelitos:

1. `christmas_90s` (**Navidad en Familia - Default**):
   - Fondo/Mesa: Mantel rojo escocés (Tartan plaid) sobre madera de pino cálida.
   - Papelitos: Textura de papel regalo retro de los 90s (bastones de caramelo, pinos pixel/vintage, dorado cálido).
   - Tipografía de cabeceras: `'Fraunces'` o `'Playfair Display'` (pesada, nostálgica).
2. `amor_amistad` (**Amor y Amistad / San Valentín**):
   - Fondo/Mesa: Madera clara con detalles en rosa viejo, terracota y crema.
   - Papelitos: Sobres de carta con sello postal vintage y corazones clásicos.
3. `reyes_magos` (**Día de Reyes / Epifanía**):
   - Fondo/Mesa: Azul medianoche estrellado con bordes dorados.
   - Papelitos: Pergamino antiguo con estrellas doradas.
4. `custom_party` (**Intercambio General / Cumpleaños / Oficina**):
   - Fondo/Mesa: Confeti retro años 90 (estilo Memphis suave / colores pastel cálidos).

---

## 4. Modelo de Base de Datos (Supabase SQL Schema)

El agente debe ejecutar o configurar la siguiente estructura de tablas:

```sql
-- 1. Tabla de Salas (Rooms)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- Ej: 'familia-parra-2026' o código corto de 6 caracteres
  title TEXT NOT NULL, -- Ej: 'Navidad Familia Parra'
  theme TEXT NOT NULL DEFAULT 'christmas_90s',
  budget TEXT, -- Ej: '$50 USD' o 'Regalo hecho a mano'
  event_date TEXT, -- Ej: '24 de Diciembre'
  admin_pin TEXT NOT NULL, -- PIN de 4 dígitos para que el anfitrión edite la sala
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Participantes y Asignaciones Pre-calculadas
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_to_id UUID REFERENCES participants(id), -- A quién le regala (pre-calculado sin auto-asignación)
  has_drawn BOOLEAN DEFAULT FALSE, -- ¿Ya hizo la animación de sacar papel?
  drawn_at TIMESTAMPTZ,
  wishlist_note TEXT, -- Ej: 'Me gustan los dulces o medias talla L'
  device_token TEXT, -- Hash guardado en localStorage para re-abrir su papel sin fricción
  recovery_pin TEXT -- PIN opcional de 4 dígitos por si abre desde otro celular
);
```

---

## 5. El Algoritmo de Sorteo Sin Fallos (`src/lib/derangement.ts`)
**REGLA CRÍTICA:** Nunca sortear en vivo a medida que entran porque la última persona puede quedarse con su propio papel. El sorteo se realiza **en el momento en que el Anfitrión crea el grupo**, garantizando un ciclo cerrado perfecto ($A \to B \to C \to A$).

```typescript
export interface ParticipantInput {
  id: string;
  name: string;
}

/**
 * Genera un ciclo cerrado (Hamiltonian Cycle) donde:
 * 1. Nadie se saca a sí mismo (No self-assignment).
 * 2. No hay sub-ciclos cerrados de 2 personas (A -> B y B -> A) si hay más de 2 participantes.
 */
export function generateSecretSantaAssignments(participants: ParticipantInput[]): Record<string, string> {
  if (participants.length < 2) {
    throw new Error("Se necesitan al menos 2 participantes.");
  }

  // Copia para barajar usando Fisher-Yates
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Asignar en cadena circular: el índice i le regala al índice (i + 1) % length
  const assignments: Record<string, string> = {};
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    assignments[giver.id] = receiver.id;
  }

  return assignments; // Mapa de { giver_id: receiver_id }
}
```

---

## 6. Flujo Paso a Paso de Pantallas (UX Ultra-Accesible)

### Pantalla 1: Creación de Sala por el Anfitrión (`/crear`)
1. **Selector Visual de Festividad:** Carrusel horizontal de tarjetas grandes (Navidad 90s, Amor y Amistad, Reyes, Otro). Al tocar una, el fondo de la app cambia instantáneamente.
2. **Datos del Evento:**
   - Nombre del grupo (Ej: *"Navidad en casa de la Abuela"*).
   - Presupuesto sugerido (Ej: *"$30"*).
3. **Lista de Participantes:**
   - Input grande con botón `"+"` enorme que permite agregar nombres rápidamente.
   - Mínimo 3 participantes. Mostrar chips grandes con botón `"X"` para borrar si se equivocó.
4. **Botón Principal:** `"Crear Mesa y Revolver Papelitos"`.
5. **Modal de Éxito + Compartir:**
   - Genera el link único y un **Botón Verde Gigante: "Enviar al Grupo de WhatsApp"** (`https://wa.me/?text=...`) con un mensaje pre-redactado amigable para la familia.

---

### Pantalla 2: El Lobby Familiar (`/room/[slug]`)
Cuando cualquier persona (ej. un adulto mayor) abre el link en su celular:
1. **Cabecera Cálida:** Muestra el título de la familia, el presupuesto y un mensaje claro:
   - *"¡Hola! Toca tu nombre en la lista de abajo para sacar tu papelito."*
2. **Lista de Participantes (Tarjetas Grandes de 1 Columna):**
   - Botones de mínimo `64px` de alto, letra `20px` en negrita.
   - **Estado Disponible:** Fondo crema cálido, borde verde pino, texto: `"👉 Soy [Nombre]"`.
   - **Estado Ya Escogió (`has_drawn = true`):** Fondo gris suave/dorado, ícono de check verde y un badge claro que dice: **`"✅ Ya tiene su papel"`**.
3. **Modal de Confirmación Anti-Error:**
   - Al tocar `"👉 Soy Roberto"`, aparece un cartel grande y amigable:
   - *"¿Seguro que eres **Roberto**? Solo debes tocar tu propio nombre."*
   - Dos botones enormes: **`"Sí, soy Roberto"`** (Verde) y **`"No, me equivoqué"`** (Rojo suave).

---

### Pantalla 3: La Mesa de los Papelitos (Simulación Interactiva)
Una vez que el usuario confirma su identidad (`"Sí, soy Roberto"`), pasa a la vista de la mesa:
1. **Vista Inicial:** Se ve una superficie de mesa de madera con mantel navideño. En el centro hay varios papelitos doblados en cuatro (con textura de papel regalo retro de los 90s).
2. **Estado 1 — Listo para Barajar:**
   - Instrucción en pantalla: *"Toca el botón para revolver bien los papeles en la mesa"*.
   - Un botón táctil grande y brillante: **`"🎲 Revolver los Papelitos"`**.
3. **Estado 2 — Animación de Shuffle y Tirada en la Mesa (`Framer Motion`):**
   - Al tocar el botón, suena audio de papeles revolviéndose (`paper-shuffle.mp3`) y el teléfono vibra (`navigator.vibrate([50, 30, 50])`).
   - Los papelitos se juntan en el centro, giran rápidamente durante 1.8 segundos y luego **se esparcen sobre la mesa** en posiciones orgánicas con ligeras rotaciones aleatorias (`rotate: -12deg` a `15deg`).
4. **Estado 3 — Selección Única:**
   - Instrucción superior: *"¡Listo! Toca UN solo papelito de la mesa para abrirlo."*
   - Cada papelito tiene una animación sutil de latido.
   - Cuando el usuario toca **cualquier** papelito:
     - Todos los demás papelitos desaparecen suavemente hacia abajo.
     - El papelito seleccionado viaja al centro de la pantalla y crece.
     - Se ejecuta una llamada `POST /api/room/[slug]/draw` que marca `has_drawn = true` en Supabase y guarda el `device_token` en el `localStorage` del celular.

---

### Pantalla 4: El Desdoble y Revelación Final
1. **Animación de Desdoble:** El papelito doblado se abre en 2 etapas (efecto origami/carta) acompañado de sonido de papel abriéndose y confeti navideño.
2. **Contenido del Papel Abierto:**
   - Diseño de papel cuadriculado o tarjeta navideña de los 90s con bordes dentados.
   - Texto claro: *"Tu amigo secreto es:"*
   - **NOMBRE EN GIGANTE (`36px` bold)** de la persona asignada (`assigned_to_id`).
   - Recordatorio del presupuesto abajo.
3. **Acciones Post-Sorteo (Pensadas para Adultos Mayores):**
   - **Botón 1 (Destacado):** `"📸 Guardar Foto de mi Papelito"` (Usa `html2canvas` para descargar una imagen del papelito al carrete del celular por si se le olvida).
   - **Sección Opcional Simple:** *"¿Qué te gustaría que te regalen a ti? Escríbelo aquí para darle una pista a tu amigo secreto"* (Input de texto simple con botón `"Guardar pista"`).

---

## 7. Mecanismo de Recuperación ("¿Qué pasa si entra de nuevo?")
- Si *Roberto* ya sacó su papel y vuelve a entrar al link desde el **mismo celular**, el sistema lee `localStorage.getItem('santa_token_[room_id]')`, lo reconoce automáticamente y le muestra un botón grande arriba de todo: **`"🎟️ Ver mi papelito guardado (Roberto)"`**.
- Si otra persona toca el nombre de *Roberto* (que ya tiene el badge `"✅ Ya tiene su papel"`), el sistema muestra un aviso: *"Roberto ya sacó su papelito. Si eres Roberto y cambiaste de celular, pide ayuda al organizador."* (El organizador puede ver un link de recuperación con su PIN de anfitrión sin ver el nombre asignado).

---

## 8. Estructura de Archivos Requerida

```text
/
├── public/
│   ├── manifest.json          # Configuración PWA (instalable en móvil)
│   ├── sounds/
│   │   ├── shuffle.mp3        # Sonido de papeles mezclándose
│   │   └── unfold.mp3         # Sonido de papel desdoblándose
│   └── textures/
│       ├── wood-table.png     # Textura sutil de madera
│       └── retro-paper.png    # Textura de papel años 90
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Fuentes (Fraunces + Plus Jakarta Sans) y PWA meta tags
│   │   ├── page.tsx           # Landing nostálgica con botón grande "Crear Sorteo Familiar"
│   │   ├── crear/
│   │   │   └── page.tsx       # Wizard de creación para el anfitrión
│   │   ├── room/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Vista principal de la sala (Lobby + Mesa + Papelito)
│   │   └── api/
│   │       └── rooms/
│   │           ├── route.ts           # POST: Crear sala + correr algoritmo Derangement
│   │           └── [slug]/
│   │               └── draw/route.ts  # POST: Marcar papel como abierto + Realtime update
│   ├── components/
│   │   ├── ThemeProvider.tsx  # Cambia estilos según festividad
│   │   ├── ParticipantList.tsx # Lista con badges "Ya escogió" y botones grandes
│   │   ├── PaperTable.tsx     # Mesa interactiva con Framer Motion (Shuffle + Selección)
│   │   └── UnfoldedPaper.tsx  # Vista final del papelito abierto + descarga de imagen
│   └── lib/
│       ├── supabase.ts        # Cliente Supabase + suscripción Realtime
│       └── derangement.ts     # Algoritmo matemático de asignación circular
```

---

## 9. Componente Clave de Referencia: `PaperTable.tsx` (Física de Mesa y Papeles)

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaperTableProps {
  participantName: string;
  assignedTargetName: string;
  totalPapers: number;
  onPaperOpened: () => Promise<void>;
}

export default function PaperTable({
  participantName,
  assignedTargetName,
  totalPapers,
  onPaperOpened,
}: PaperTableProps) {
  const [stage, setStage] = useState<"ready" | "shuffling" | "spread" | "unfolding" | "revealed">("ready");
  const [selectedPaperIndex, setSelectedPaperIndex] = useState<number | null>(null);

  // Generar posiciones orgánicas en la mesa para hasta 12 papelitos visibles
  const visibleCount = Math.min(Math.max(totalPapers, 5), 12);
  const [paperPositions, setPaperPositions] = useState(
    Array.from({ length: visibleCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      rotate: (i % 2 === 0 ? 1 : -1) * (i * 5),
    }))
  );

  const handleShuffle = () => {
    setStage("shuffling");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 60, 40, 80]);
    }

    // Simular barajado y luego tirar los papeles en la mesa
    setTimeout(() => {
      const spreadPositions = paperPositions.map((p, idx) => {
        const col = (idx % 3) - 1; // -1, 0, 1
        const row = Math.floor(idx / 3) - 1;
        return {
          id: p.id,
          x: col * 85 + (Math.random() * 24 - 12),
          y: row * 75 + (Math.random() * 24 - 12),
          rotate: Math.floor(Math.random() * 40) - 20,
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
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }
    await onPaperOpened();
    setTimeout(() => {
      setStage("revealed");
    }, 1200);
  };

  return (
    <div className="min-h-[82vh] w-full flex flex-col items-center justify-between p-4 rounded-3xl bg-[#5c2c16] border-8 border-[#3e1d0d] shadow-2xl relative overflow-hidden">
      {/* Textura de mantel navideño de los 90s en los bordes */}
      <div className="z-10 text-center bg-[#fdf8f0] px-6 py-4 rounded-2xl border-4 border-[#c83e31] shadow-md max-w-md w-full">
        <p className="text-sm uppercase tracking-widest text-[#8c583a] font-bold">
          Turno de {participantName}
        </p>
        <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#2b1810] mt-1">
          {stage === "ready" && "Paso 1: Revuelve los papelitos en la mesa"}
          {stage === "shuffling" && "¡Revolviendo bien los papelitos...!"}
          {stage === "spread" && "Paso 2: Toca UN papelito para abrirlo"}
          {stage === "unfolding" && "Abriendo tu papelito..."}
          {stage === "revealed" && "¡Guarda tu secreto!"}
        </h2>
      </div>

      {/* Área Central de la Mesa */}
      <div className="relative flex-1 w-full flex items-center justify-center my-4">
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
                          x: [0, (idx % 2 ? 40 : -40), (idx % 3 ? -30 : 30), 0],
                          y: [0, (idx % 3 ? -40 : 40), (idx % 2 ? 30 : -30), 0],
                          rotate: [0, 180, -180, 360],
                          scale: 1.05,
                        }
                      : stage === "unfolding" && isSelected
                      ? { x: 0, y: 0, rotate: 0, scale: 2.2 }
                      : { x: paper.x, y: paper.y, rotate: paper.rotate, scale: 1 }
                  }
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: stage === "shuffling" ? 1.4 : 0.6, type: "spring" }}
                  className="absolute w-24 h-20 bg-[#f6ecd9] border-2 border-[#d4be98] rounded-md shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, #c83e31 0px, #c83e31 4px, transparent 4px, transparent 16px)",
                  }}
                >
                  <div className="bg-[#fdf8f0] px-2 py-1 rounded border border-[#d4be98] shadow-inner">
                    <span className="text-xs font-serif font-bold text-[#2b1810]">
                      {stage === "spread" ? "Tócame" : "🎄"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* Papelito Desdoblado Final */}
        {stage === "revealed" && (
          <motion.div
            initial={{ scale: 0.5, rotateX: 90, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            className="bg-[#fffdf7] p-8 rounded-lg border-4 border-dashed border-[#2e6b4e] shadow-2xl max-w-sm w-full text-center relative"
          >
            <p className="text-base text-[#5c4938] font-medium">Te tocó regalarle a:</p>
            <div className="my-6 py-4 px-2 bg-[#f4ebd9] rounded-xl border-2 border-[#d8c39e]">
              <span className="text-3xl md:text-4xl font-serif font-black text-[#b8291d] tracking-tight block">
                {assignedTargetName}
              </span>
            </div>
            <p className="text-sm text-[#6e5a47]">
              🤫 ¡No se lo digas a nadie! Este papelito ya quedó guardado a tu nombre.
            </p>
          </motion.div>
        )}
      </div>

      {/* Botón Inferior de Acción para Adultos Mayores */}
      <div className="z-10 w-full max-w-md">
        {stage === "ready" && (
          <button
            onClick={handleShuffle}
            className="w-full py-5 bg-[#2e6b4e] hover:bg-[#23533c] text-white text-xl font-bold rounded-2xl border-b-4 border-[#193b2b] shadow-lg active:translate-y-1 transition-all"
          >
            🎲 Revolver los Papelitos
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 10. Checklist de Implementación para el Agente Constructor
1. Inicializar proyecto con `npx create-next-app@latest papelitos-pwa --typescript --tailwind --app`.
2. Instalar dependencias: `npm install framer-motion canvas-confetti lucide-react @supabase/supabase-js html2canvas`.
3. Configurar variables de entorno `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Implementar el motor de temas en `globals.css` con paletas nostálgicas de los 90s y tipografía grande mínima (`18px` base en móvil).
5. Verificar que una vez que un usuario saca su papelito, la lista principal en `/room/[slug]` muestre inmediatamente el badge `"✅ Ya tiene su papel"` y bloquee que otra persona vuelva a sortear por él.