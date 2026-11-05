# 🎄 Papelitos (OnePick)

> **Motor Nostálgico de Amigo Secreto & Festividades (PWA)**  
> Diseñado especialmente para familias multigeneracionales y adultos mayores con baja alfabetización digital.

---

## 🌟 Principios de UX y Cero Fricción

- **Cero Registro:** PROHIBIDO pedir email, contraseñas o descargas de app stores. Todo funciona mediante un enlace único (`/room/[slug]`).
- **Nostalgia Familiar de los 90s:** Texturas de mesa de comedor, manteles tradicionales, papel kraft y animación de papel doblado en cuatro.
- **Accesibilidad Primero:** Botones grandes (mínimo `64px` de alto), tipografía legible (`18px+`), alto contraste y confirmación anti-error antes de abrir.
- **Sorteo Seguro:** Ciclo Hamiltoniano pre-calculado al crear el grupo ($A \to B \to C \to A$) garantizando que nadie se saque a sí mismo y no existan subciclos disjuntos.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Estilos:** Tailwind CSS + variables CSS dinámicas por festividad
- **Animaciones:** Framer Motion (física de mesa, shuffle y desdoble 3D) + `canvas-confetti`
- **Iconos:** Lucide React
- **Audio & Háptica:** Web Audio API sintético + `navigator.vibrate()`
- **Base de Datos & Realtime:** Supabase (PostgreSQL) con fallback local en memoria para desarrollo inmediato

---

## 🚀 Inicio Rápido

### 1. Clonar e Instalar Dependencias

```bash
git clone https://github.com/feparra/onepick.git
cd onepick
npm install
```

### 2. Variables de Entorno (Opcional para Supabase)

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

> *Nota:* Si no configuras las variables de Supabase, la aplicación funcionará automáticamente con un almacén en memoria para pruebas y desarrollo local.

### 3. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador o desde tu celular conectado a la red local.

---

## 🗄️ Esquema de Base de Datos (Supabase)

El script SQL completo para inicializar las tablas `rooms` y `participants` con sus políticas de Row Level Security (RLS) se encuentra en:
[`supabase/schema.sql`](./supabase/schema.sql).

---

## 🎨 Temas Dinámicos Soportados

1. `christmas_90s`: Mantel tartán escocés rojo y pino cálido (Default).
2. `amor_amistad`: Madera suave, rosa vintage y terracota.
3. `reyes_magos`: Azul medianoche y destellos dorados.
4. `custom_party`: Retro Memphis 90s con confeti y colores pastel.
