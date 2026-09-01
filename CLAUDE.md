# SlakyFit — contexto del proyecto

Lee esto antes de tocar código. Resume la especificación original, las decisiones
tomadas y el estado actual, para poder continuar el trabajo desde cualquier
ordenador sin perder contexto.

## Filosofía del producto

> La app recomienda. El usuario decide. Los datos reales mandan.

App de gimnasio mobile-first. Prioridad absoluta: registrar una serie (peso, reps,
RIR) con el mínimo de clics posible, incluso cansado y con una sola mano. La app
sugiere una secuencia de entrenamiento (Push A → Pull A → Pierna → Push B → Pull B
→ repetir) pero **nunca bloquea**: el usuario puede entrenar lo que quiera, sustituir
ejercicios, cambiar series/peso/reps libremente. Todo lo real se guarda tal cual;
lo previsto (plantilla) se guarda aparte para comparar.

El pliego funcional completo (36 secciones, en español) que originó este proyecto
vive en el historial de la conversación de Claude Code donde se construyó — no está
copiado aquí íntegro para no duplicar 900 líneas, pero todo lo relevante de esas
secciones ya está reflejado en las decisiones de abajo y en el código.

## Stack

- React 18 + Vite + TypeScript + Tailwind CSS.
- **Sin backend, sin base de datos.** Todo se persiste en `localStorage` del
  navegador (ver `src/data/storage.ts`). Esto es una decisión consciente para V1:
  gratis, sin servidor que mantener, cero fricción para desplegar. Implica que los
  datos son por dispositivo/navegador — no hay sync entre el iPhone y el PC todavía
  (está en el roadmap, ver más abajo).
- `react-router-dom` con `HashRouter` (no `BrowserRouter`) — elegido a propósito
  porque así funciona directamente en GitHub Pages sin configuración de rewrites.
- `recharts` para las gráficas (peso corporal, e1RM, volumen por músculo).
- Tema oscuro únicamente (no hay modo claro, no estaba en el alcance).

## Arquitectura

```
src/
  types/index.ts        Todos los tipos de dominio (Exercise, WorkoutSession, etc.)
  data/
    exercises.ts         Biblioteca de 88 ejercicios (main/abs/mobility/flexibility)
    exerciseMedia.ts      Mapeo id -> fotos reales (ver sección Media abajo)
    routines.ts           Las 5 plantillas: push-a, pull-a, legs, push-b, pull-b
    routineLists.ts       Rutinas cortas de ABS/Movilidad/Flexibilidad
    phases.ts             Fases del programa (Reentrada/Construcción/Trabajo normal) y RIR objetivo
    progression.ts        Algoritmo de progresión (doble progresión + RIR), e1RM, PRs, calentamiento
    recommendation.ts     Qué entrenamiento toca según el último realmente hecho
    analytics.ts          Volumen por músculo, frecuencia, récord más reciente
    demoSeed.ts            Genera los datos iniciales (perfil, programa, objetivos) — YA NO genera
                           entrenamientos falsos, ver "Decisiones" abajo
    storage.ts             Capa de persistencia localStorage + STORAGE_KEYS (incluye
                           STORAGE_KEYS.seeded — subir su versión fuerza un re-seed limpio)
    store.tsx              Contexto de React + hooks (useAppStore) que envuelve todo lo anterior
  lib/                    Utilidades puras: formato de fechas, búsqueda de ejercicios,
                          bloqueo de scroll de fondo, colores de categoría/gráficas, etc.
  components/             UI reutilizable: Stepper (con teclado numérico integrado),
                          RIRSelector, ExerciseMedia, ExerciseInfoModal, BottomNav, charts/...
  screens/                Una carpeta por sección de la navegación inferior
                          (Dashboard, train/, calendar/, progress/, library/, more/)
```

## Decisiones tomadas (y el porqué)

- **Media de ejercicios**: se integró [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (dataset abierto, gratis, sin API key) servido vía jsDelivr. 71 de los 88 ejercicios
  tienen 2 fotos reales (posición inicial/final) mapeadas a mano y verificadas una
  por una (`src/data/exerciseMedia.ts`). Los que no tienen equivalente exacto en el
  dataset se quedan con un placeholder ilustrado (`MediaPlaceholder.tsx`).
- **Vídeo**: cada ficha tiene un botón "Ver técnica en YouTube" que abre una
  **búsqueda** de YouTube con el nombre del ejercicio (`youtubeSearchUrl` en
  `ExerciseMedia.tsx`), no un enlace a un vídeo concreto. Decisión explícita del
  usuario: un enlace directo a un vídeo específico se puede romper con el tiempo
  (borrado/privado) y no hay backend para vigilarlo; la búsqueda nunca se rompe.
  Si en el futuro se quiere revisar esto, la conversación original sopesó también
  "vídeo concreto solo para los ~30 ejercicios de las 5 rutinas activas" como
  término medio razonable.
- **Hosting**: GitHub Pages (gratis, sin cuenta adicional). El despliegue es
  automático vía `.github/workflows/deploy.yml` en cada push a `main`. El `base`
  de Vite se inyecta en build time con `BASE_PATH=/<nombre-repo>/` para que funcione
  como project site sin tocar `vite.config.ts` a mano.
- **Programa/semana**: el programa "Vuelta al gimnasio V1" arranca el día antes del
  primer uso real de la app (`demoSeed.ts`, `programStart = ayer`), sin entrenamientos
  de ejemplo — el primer día de uso real es limpio (Semana 1, sin historial). Antes
  hubo una versión con ~3 semanas de historial simulado para poder enseñar
  calendario/gráficas; se quitó porque confundía al usuario real. Si se necesita
  volver a generar datos de demostración para pruebas de UI, hacerlo en una rama
  aparte, no en `demoSeed.ts` (eso alimenta la app real).
- **`STORAGE_KEYS.seeded`** tiene un sufijo de versión (`seeded-v2`). Si se cambia
  la lógica de semilla otra vez, súbele el número — así los usuarios que ya tienen
  la app abierta reciben el nuevo seed limpio en vez de quedarse con datos viejos
  cacheados en memoria/localStorage (esto pasó una vez y causó confusión: la pestaña
  ya abierta seguía reescribiendo el `sessions` viejo en localStorage).
- **Búsqueda de ejercicios** (`lib/exerciseSearch.ts`): coincidencia por prefijo de
  palabra (no substring libre, para evitar falsos positivos tipo "ab" encontrando
  "cabeza" o "abducción") + un diccionario de sinónimos músculo↔términos coloquiales
  en español ("abs"/"abdominales" → `core`, "pierna" → cuádriceps/isquios/glúteo/
  gemelos, etc.). Se usa en Biblioteca, Añadir/Cambiar ejercicio y Progreso→Ejercicios.

## Estado actual (funcional y probado end-to-end con Playwright)

Todo el flujo principal funciona: Inicio → elegir/empezar entreno → registrar
series (con recomendación de peso, calentamiento sugerido, teclado numérico) →
sustituir/añadir ejercicios (incluye ABS) → finalizar (opción de añadir ABS) →
verlo en Calendario (con PRs) → Progreso (Cuerpo/Entrenamiento/Ejercicios/Objetivos,
con gráficas) → Biblioteca con fichas completas y fotos reales → secciones
secundarias (ABS/Movilidad/Flexibilidad/Programas/Perfil) como listados simples.

## Cómo correrlo en local

```bash
npm install   # solo hace falta si es la primera vez o cambió package.json
npm run dev   # abre http://localhost:5173 (o el puerto que imprima en consola)
```

`npm run build` compila a `dist/` (usado por el workflow de despliegue, no hace
falta ejecutarlo a mano salvo para depurar el build).

## Despliegue

Cada `git push` a `main` dispara `.github/workflows/deploy.yml`, que compila y
publica en GitHub Pages automáticamente. **Importante**: la primera vez hay que
haber puesto manualmente en GitHub → Settings → Pages → Source: "GitHub Actions"
*antes* de que el workflow intente desplegar, si no el paso `deploy-pages` falla
con "site not found" aunque el build vaya bien. Si eso pasa, no hace falta un
commit nuevo: basta con ir a la pestaña Actions → el workflow → "Run workflow"
para relanzarlo ahora que Pages ya está configurado.

URL pública: `https://marcmuu.github.io/SlakyFit/`

## Trabajar desde otro ordenador

```bash
git clone https://github.com/Marcmuu/SlakyFit.git
cd SlakyFit
npm install
npm run dev
```

Con eso se puede seguir editando y haciendo `git push` desde cualquier máquina.
Este archivo (`CLAUDE.md`) se carga automáticamente al abrir Claude Code en esta
carpeta, así que no hace falta pegar ningún prompt a mano — si se usa otra IA,
pegar este archivo entero como primer mensaje cumple la misma función.

## Pendiente / roadmap (del pliego original, todavía no implementado)

Estas cosas se dejaron fuera de la V1 a propósito, pero la arquitectura de datos
no las bloquea:

- Temporizador de descansos (30s/60s/90s/2-3min, auto-inicio tras guardar serie).
- Superseries en la UI (el modelo de datos ya lo permitiría con cambios menores).
- Rutinas 100% personalizadas / generador automático de rutinas.
- Entrenador conversacional con IA / recomendaciones más sofisticadas.
- Gestión de fatiga, ejercicios favoritos / ejercicios a evitar.
- Equipamiento disponible por gimnasio.
- Fotos de progreso, medidas corporales adicionales (aparte de peso).
- Nutrición.
- Exportar/importar datos (útil ya mismo dado que todo es local — sería la forma
  más simple de "sincronizar" manualmente entre el iPhone y el PC sin backend).
- Cuentas de usuario reales y sincronización en la nube (hoy: local por dispositivo).
- PWA instalable de verdad (hoy: "Añadir a pantalla de inicio" de Safari, que ya
  da un icono y pantalla completa, pero sin Service Worker/offline real).

## Convenciones de estilo

- Sin comentarios en el código salvo que expliquen un porqué no obvio (ver los
  pocos que ya existen como referencia de tono).
- Sin abstracciones prematuras: se prioriza duplicar un poco antes que crear una
  capa genérica para 2 usos.
- Todo el copy de la interfaz en español.
- Antes de tocar gráficas o colores, seguir la guía interna de dataviz que ya se
  aplicó (paleta categórica fija en `lib/chartColors.ts`, un solo hue por gráfica
  de serie única, sin dual-axis, tooltips en hover).
