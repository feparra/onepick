# 🎄 Papelitos (OnePick)

> **Motor Nostálgico de Amigo Secreto & Festividades (PWA)**  
> *Bilingüe (Español / English) & Ultra-Accesible.*  
> Diseñado especialmente para familias multigeneracionales y adultos mayores con baja alfabetización digital.

---

## 🌟 Principios de UX y Seguridad

- **Cero Fricción:** PROHIBIDO pedir email, contraseñas complejas o descargas de app stores. Todo funciona mediante un enlace único (`/room/[slug]`).
- **Seguridad con PIN Personal de 4 Dígitos:** Cada participante define un PIN de 4 dígitos la primera vez que toca su nombre. Nadie más puede abrir o espiar su papelito sin ese PIN.
- **Bilingüe (ES / EN):** Selector instantáneo de idioma en la cabecera (`🇪🇸 ES` / `🇬🇧 EN`) con persistencia en `localStorage`.
- **Nostalgia Familiar de los 90s:** Texturas de mesa de comedor, manteles tradicionales, papel kraft y animación de papel doblado en cuatro.
- **Accesibilidad Primero:** Botones táctiles grandes (mínimo `64px` de alto), tipografía legible (`18px+`), alto contraste y confirmación anti-error.
- **Sorteo Seguro:** Ciclo Hamiltoniano pre-calculado al crear el grupo ($A \to B \to C \to A$) garantizando que nadie se saque a sí mismo y no existan subciclos disjuntos.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Estilos:** Tailwind CSS + variables CSS dinámicas por festividad
- **Animaciones:** Framer Motion (física de mesa, shuffle y desdoble 3D) + `canvas-confetti`
- **Iconos:** Lucide React
- **Audio & Háptica:** Web Audio API sintético + `navigator.vibrate()`
- **Persistencia Flexible:**
  - **SQLite Local (Recomendado para servidores Windows/Linux):** Utiliza `data/papelitos.sqlite` persistente sin dependencias externas.
  - **Supabase Cloud (Opcional):** PostgreSQL con Row Level Security (RLS).

---

## 🚀 Cómo Correrlo en un Servidor Windows

El backend está integrado en Next.js. Para correrlo en tu servidor Windows con SQLite:

1. **Requisitos:** Node.js (v20+, recomendado v22.5+ o v24).
2. **Clonar e instalar dependencias:**
   ```powershell
   git clone https://github.com/feparra/onepick.git
   cd onepick
   npm install
   ```
3. **Construir el proyecto:**
   ```powershell
   npm run build
   ```
4. **Iniciar en producción:**
   ```powershell
   npm start
   ```
   *Opcional con PM2 para que corra como servicio en segundo plano:*
   ```powershell
   npm install -g pm2
   pm2 start npm --name "onepick" -- start
   pm2 save
   ```
5. La base de datos SQLite se crea automáticamente en la carpeta `data/papelitos.sqlite`.

---

## 🎨 Temas Dinámicos Soportados

1. `christmas_90s`: Mantel tartán escocés rojo y pino cálido (Default).
2. `amor_amistad`: Madera suave, rosa vintage y terracota.
3. `reyes_magos`: Azul medianoche y destellos dorados.
4. `custom_party`: Retro Memphis 90s con confeti y colores pastel.
