# SlakyFit — contexto del proyecto

Lee esto antes de tocar código. Resume la especificación original, las decisiones
tomadas y el estado actual, para poder continuar el trabajo desde cualquier
ordenador sin perder contexto.

## Filosofía del producto

> La app recomienda. El usuario decide. Los datos reales mandan.

App de gimnasio mobile-first. Prioridad absoluta: registrar una serie (peso, reps,
RIR) con el mínimo de clics posible, incluso cansado y con una sola mano. La app
sugiere qué día toca según la rutina activa del usuario, pero **nunca bloquea**:
el usuario puede entrenar lo que quiera, sustituir ejercicios, cambiar
series/peso/reps libremente, y editar/crear entrenamientos en cualquier día del
calendario (no solo "hoy"). Todo lo real se guarda tal cual; lo previsto (la
rutina) se guarda aparte para comparar.

Nota histórica: la V1 nació con 5 rutinas fijas (Push A/Pull A/Pierna/Push B/Pull B,
`data/routines.ts`) como único programa posible. Eso evolucionó a un **sistema de
rutinas 100% personalizadas** (`Routine` → `RoutineDay[]` → ejercicios editables,
ver Arquitectura) donde el usuario crea, edita, duplica y activa las suyas. Las 5
rutinas originales sobreviven solo como semilla de la "Rutina 1" que se genera la
primera vez (`data/migrateRoutines.ts`), no como concepto especial en el código.

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
  types/index.ts        Todos los tipos de dominio. Los que más importan:
                        Routine (días editables, cada uno con su lista de ejercicios
                        objetivo) · WorkoutSession (lo realmente registrado ese día,
                        con routineId/dayId de referencia si vino de una rutina) ·
                        SetEntry (weight/reps/durationSec según logType, más rir:
                        RirRange) · ActiveWorkout (el entreno "en directo" ahora mismo)
  data/
    exercises.ts         Biblioteca de 88 ejercicios (main/abs/mobility/flexibility)
    exerciseMedia.ts      Mapeo id -> fotos reales (ver sección Media abajo)
    routines.ts           Las 5 plantillas originales (push-a/pull-a/legs/push-b/pull-b),
                          hoy solo usadas para generar la "Rutina 1" semilla
    routineLists.ts       Rutinas cortas de ABS/Movilidad/Flexibilidad
    routineAnalysis.ts     Reglas para "Analizar rutina": volumen por músculo del
                          ciclo completo, detección de ejercicios estancados
    phases.ts             Fases del programa (Reentrada/Construcción/Trabajo normal) y RIR objetivo
    progression.ts        Recomendación de peso/reps siguiente (por logType), e1RM, PRs, calentamiento
    recommendation.ts     Qué día de la rutina activa toca según el último realmente hecho
    analytics.ts          Volumen por músculo, frecuencia, récord más reciente
    demoSeed.ts            Genera los datos iniciales (perfil, programa, objetivos) — NO genera
                           entrenamientos falsos, ver "Decisiones" abajo
    migrateRoutines.ts      Migración one-shot: crea "Rutina 1" desde las 5 plantillas legacy
                          si el usuario no tiene ninguna rutina todavía
    migrateRir.ts           Migración one-shot: RIR numérico antiguo -> RirRange
    storage.ts             Capa de persistencia localStorage + STORAGE_KEYS (incluye
                           STORAGE_KEYS.seeded — subir su versión fuerza un re-seed limpio)
    store.tsx              Contexto de React + hooks (useAppStore) que envuelve todo lo anterior
  lib/                    Utilidades puras: formato de fechas, búsqueda de ejercicios,
                          bloqueo de scroll de fondo (useBodyScrollLock), colores de
                          categoría/día/gráficas, setFormat (describeSet/effectiveWeight
                          según logType), rir (rangos <-> punto medio numérico)
  components/             UI reutilizable: Stepper (con teclado numérico integrado),
                          RIRSelector (por rangos), ExerciseMedia, ExerciseInfoModal,
                          RestTimer, ActionSheet, BottomNav, charts/...
  screens/                Una carpeta por sección de la navegación inferior
                          (Dashboard, train/, calendar/, progress/, library/, more/,
                          routines/ para crear/editar/analizar rutinas)
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
- **RIR por rangos, no valor exacto**: `RirRange = '0-1' | '1-2' | '2-3' | '3+'`
  (antes era un número 0-4). Más rápido de tocar durante el entreno y más realista
  (nadie sabe si fue RIR 2 o 3 con precisión). `lib/rir.ts` tiene el punto medio de
  cada rango para cuando el algoritmo de progresión necesita comparar contra un
  RIR objetivo numérico de la fase.
- **Tipos de registro por ejercicio** (`ExerciseLogType`): `weight-reps` (peso
  externo normal), `bodyweight-reps` (dominadas, fondos... con lastre opcional) y
  `time` (plancha y similares, se registra duración en vez de peso/reps). Todo el
  cálculo de volumen/e1RM/PR pasa por `lib/setFormat.ts` para no repetir esta
  lógica de "qué significa este set según el tipo" en cada pantalla.
- **Backfill de entrenamientos pasados** (`SessionEditor.tsx`, accesible desde
  Calendario → día → "+ Añadir entrenamiento"): replica el flujo de "elegir rutina
  → elegir día → se cargan los ejercicios con sus series" del entreno en directo,
  pero sin cronómetro ni conteo de tiempo (no tiene sentido para algo que no está
  pasando ahora). Si ya hay ejercicios cargados y se cambia de día, pide
  confirmación antes de sustituirlos. La fecha es editable a propósito — mover un
  entrenamiento de día es una operación válida, no un bug.
- **"Analizar rutina"** (`routineAnalysis.ts` + `screens/routines/AnalyzeRoutine.tsx`):
  reglas internas simples, sin llamar a ningún modelo de IA — volumen planificado
  por músculo (suma de series objetivo de un ciclo completo de la rutina activa,
  aviso si algún músculo queda por debajo de 6 series/ciclo) y detección de
  ejercicios estancados (e1RM de la sesión más reciente vs. la de hace 3 sesiones
  para ese ejercicio, si no mejora al menos 1% se marca). Es la base sobre la que
  se podría montar más adelante una "exportación para IA" (backlog, no empezada).

## Estado actual (funcional y probado end-to-end con Playwright)

Todo el flujo principal funciona: Inicio → elegir/empezar entreno de la rutina
activa → registrar series (recomendación de peso, calentamiento sugerido, teclado
numérico, temporizador de descanso opcional entre series) → sustituir/añadir
ejercicios (incluye ABS) → finalizar → verlo en Calendario (con PRs, editable,
backfill de días pasados con el mismo selector rutina→día que el entreno en
directo) → Progreso (Cuerpo/Entrenamiento/Ejercicios/Objetivos, con gráficas e
historial navegable por ejercicio) → Biblioteca con fichas completas y fotos
reales → Mis rutinas (crear/editar/duplicar/eliminar/activar, días y ejercicios
editables) → Analizar rutina (volumen por músculo del ciclo, ejercicios
estancados) → Configuración (exportar/importar backup completo en JSON) →
secciones secundarias (ABS/Movilidad/Flexibilidad/Programas/Perfil).

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

## Pendiente / roadmap

Ya hecho (tachado del backlog original): temporizador de descansos, rutinas 100%
personalizadas, RIR por rangos, backfill/edición de entrenamientos pasados con
carga de ejercicios por rutina+día, historial navegable por ejercicio, tipos de
ejercicio peso corporal/tiempo, exportar/importar backup JSON, análisis de rutina
por reglas.

Lo que sigue sin empezar:

- **Ejercicios de cardio (distancia/tiempo)**: descartado por ahora porque no hay
  ningún ejercicio de cardio en la biblioteca todavía; `ExerciseLogType: 'time'`
  ya existente lo soportaría con poco cambio si se añaden.
- **Exportación para IA**: botón "Analizar con IA" que genere un prompt con el
  historial listo para pegar en ChatGPT/Claude, más un formato para importar de
  vuelta rutinas que la IA proponga. No empezado — es el paso natural después de
  "Analizar rutina" (reglas internas) si se quiere análisis más sofisticado.
- Superseries en la UI (el modelo de datos ya lo permitiría con cambios menores).
- Gestión de fatiga, ejercicios favoritos / ejercicios a evitar.
- Equipamiento disponible por gimnasio.
- Fotos de progreso, medidas corporales adicionales (aparte de peso).
- Nutrición.
- **Usuarios, login y base de datos real**: nada empezado. Deliberadamente al
  final por ser un cambio de arquitectura grande. Recomendación cuando se aborde:
  Supabase (Postgres + Auth con email/contraseña, encaja con el modelo de datos
  ya construido). Hacer un plan explícito antes de tocar nada aquí — no empezar
  a mitad de otra tarea.
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
