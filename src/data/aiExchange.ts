import type { Routine, RoutineDay, WorkoutSession, Profile, Goal, Equipment, ExerciseLogType, Muscle } from '../types'
import { getAllExercises, getExercise } from './exercises'
import { getExerciseHistory } from './progression'
import { describeSet } from '../lib/setFormat'
import { newId } from '../lib/id'
import { colorForDayIndex } from '../lib/color'
import { addCustomExercise } from './customExercises'

const VALID_EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'smith', 'plate', 'bodyweight']
const VALID_LOGTYPE: ExerciseLogType[] = ['weight-reps', 'bodyweight-reps', 'time']
const VALID_MUSCLE: Muscle[] = ['pecho', 'espalda', 'hombro', 'biceps', 'triceps', 'cuadriceps', 'isquios', 'gluteo', 'gemelos', 'core', 'antebrazo']

const HISTORY_SESSIONS_PER_EXERCISE = 8

export interface AiExportSummary {
  routineCount: number
  sessionCount: number
  exerciseCount: number
}

export function buildAiExportSummary(routines: Routine[], sessions: WorkoutSession[]): AiExportSummary {
  const exerciseIds = new Set(sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)))
  return { routineCount: routines.length, sessionCount: sessions.length, exerciseCount: exerciseIds.size }
}

// Genera el texto completo (prompt + datos reales) listo para pegar en
// ChatGPT/Claude/Gemini. El formato de respuesta que se le pide a la IA es
// intencionadamente el mismo shape que RoutineDay/RoutineDayExercise, para
// poder reconstruir una Routine real al importar la respuesta.
export function buildAiExportText(params: { profile: Profile; routines: Routine[]; sessions: WorkoutSession[]; goals: Goal[] }): string {
  const { profile, routines, sessions, goals } = params
  const allExercises = getAllExercises().filter((e) => e.section === 'main')

  const catalogLines = allExercises
    .map((e) => `${e.id} | ${e.name} | ${e.mainMuscles.join('/')} | ${e.equipment} | ${e.logType}`)
    .join('\n')

  const routinesText = routines
    .map((r) => {
      const days = r.days
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((d) => {
          const items = d.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((it) => {
              const ex = getExercise(it.exerciseId)
              return `    - ${ex?.name ?? it.exerciseId} (${it.exerciseId}): ${it.targetSets}x${it.repMin}-${it.repMax}`
            })
            .join('\n')
          return `  Día "${d.name}":\n${items}`
        })
        .join('\n')
      return `Rutina "${r.name}":\n${days}`
    })
    .join('\n\n')

  const usedExerciseIds = Array.from(new Set(sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId))))
  const historyText = usedExerciseIds
    .map((id) => {
      const ex = getExercise(id)
      if (!ex) return null
      const entries = getExerciseHistory(id, sessions).slice(0, HISTORY_SESSIONS_PER_EXERCISE)
      if (entries.length === 0) return null
      const lines = entries.map((e) => `  ${e.date}: ${e.sets.map((s) => `${describeSet(ex, s)}${s.rir ? ` RIR${s.rir}` : ''}`).join(', ')}`).join('\n')
      return `${ex.name} (${id}):\n${lines}`
    })
    .filter((line): line is string => line !== null)
    .join('\n\n')

  const goalsText = goals.map((g) => `- ${g.label}: ${g.current}/${g.target} ${g.unit}`).join('\n')

  const profileText = `Nombre: ${profile.name || '(sin especificar)'} · Edad: ${profile.age || '?'} · Altura: ${profile.heightCm || '?'} cm · Peso: ${profile.weightKg || '?'} kg · Experiencia: ${profile.experience || '(sin especificar)'}`

  return `Eres un entrenador personal experto en hipertrofia y fuerza. Te paso mis datos reales de entrenamiento de mi app (SlakyFit): mi perfil, mi(s) rutina(s) actual(es), mi historial de series registradas (peso, repeticiones y RIR) y el catálogo de ejercicios disponibles en la app.

Analiza:
1. Progresión y posibles estancamientos (mismo peso/reps varias sesiones seguidas).
2. Volumen semanal por grupo muscular y si hay descompensaciones.
3. Equilibrio empuje/tirón/pierna y variedad de ejercicios.
4. Cualquier otra mejora que veas razonable dado mi historial real.

Escribe ese análisis primero, en texto normal.

Después, propón UNA rutina (puede ser un ajuste de la actual o una nueva) y devuélvela en un bloque de código \`\`\`json al final de tu respuesta, con EXACTAMENTE este formato (nada de texto después de ese bloque):

{
  "routineName": "Nombre de la rutina propuesta",
  "summary": "1-3 frases explicando qué cambiaste y por qué",
  "days": [
    {
      "name": "Nombre del día (ej. Push A)",
      "exercises": [
        { "exerciseId": "id-exacto-del-catalogo-de-abajo", "targetSets": 3, "repMin": 8, "repMax": 12 }
      ]
    }
  ]
}

Si quieres proponer un ejercicio que NO está en el catálogo de abajo, en ese elemento usa "newExercise" en vez de "exerciseId":
{ "newExercise": { "name": "Nombre del ejercicio", "muscles": ["hombro"], "equipment": "machine", "logType": "weight-reps" }, "targetSets": 3, "repMin": 8, "repMax": 12 }
(equipment debe ser uno de: barbell, dumbbell, machine, cable, smith, plate, bodyweight — logType uno de: weight-reps, bodyweight-reps, time — muscles del listado: pecho, espalda, hombro, biceps, triceps, cuadriceps, isquios, gluteo, gemelos, core, antebrazo)

=== MI PERFIL ===
${profileText}

=== MIS OBJETIVOS ===
${goalsText || 'Sin objetivos definidos.'}

=== MI(S) RUTINA(S) ACTUAL(ES) ===
${routinesText || 'No tengo ninguna rutina creada todavía.'}

=== MI HISTORIAL DE ENTRENAMIENTOS (últimas sesiones por ejercicio, la más reciente primero) ===
${historyText || 'Todavía no he registrado ningún entrenamiento.'}

=== CATÁLOGO DE EJERCICIOS DISPONIBLES EN LA APP (id | nombre | músculos | equipo | tipo de registro) ===
${catalogLines}
`
}

export interface AiProposedExerciseNew {
  name: string
  muscles: Muscle[]
  equipment: Equipment
  logType: ExerciseLogType
}

export interface AiProposedExerciseItem {
  exerciseId?: string
  newExercise?: AiProposedExerciseNew
  targetSets: number
  repMin: number
  repMax: number
}

export interface AiProposedDay {
  name: string
  exercises: AiProposedExerciseItem[]
}

export interface AiRoutineProposal {
  routineName: string
  summary?: string
  days: AiProposedDay[]
}

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/```\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1)
  throw new Error('No se encontró un bloque JSON en el texto pegado. Asegúrate de copiar la respuesta completa de la IA.')
}

// Valida y normaliza la respuesta de la IA. Lanza un Error con un mensaje en
// español listo para mostrar al usuario si algo no encaja.
export function parseAiRoutineProposal(rawText: string): AiRoutineProposal {
  const jsonText = extractJsonBlock(rawText)
  let data: unknown
  try {
    data = JSON.parse(jsonText)
  } catch {
    throw new Error('El bloque JSON no es válido. Revisa que hayas copiado la respuesta completa de la IA, sin cortar nada.')
  }
  if (!data || typeof data !== 'object') throw new Error('Formato inesperado en la respuesta.')
  const obj = data as Record<string, unknown>
  if (typeof obj.routineName !== 'string' || !obj.routineName.trim()) throw new Error('Falta "routineName" en el JSON.')
  if (!Array.isArray(obj.days) || obj.days.length === 0) throw new Error('Falta "days" (al menos un día) en el JSON.')

  const days: AiProposedDay[] = obj.days.map((rawDay, di) => {
    if (!rawDay || typeof rawDay !== 'object') throw new Error(`El día #${di + 1} no es válido.`)
    const d = rawDay as Record<string, unknown>
    if (typeof d.name !== 'string' || !d.name.trim()) throw new Error(`Al día #${di + 1} le falta "name".`)
    if (!Array.isArray(d.exercises) || d.exercises.length === 0) throw new Error(`El día "${d.name}" no tiene ejercicios.`)

    const exercisesOut: AiProposedExerciseItem[] = d.exercises.map((rawEx, ei) => {
      if (!rawEx || typeof rawEx !== 'object') throw new Error(`El ejercicio #${ei + 1} del día "${d.name}" no es válido.`)
      const e = rawEx as Record<string, unknown>
      const targetSets = Number(e.targetSets)
      const repMin = Number(e.repMin)
      const repMax = Number(e.repMax)
      if (!targetSets || !repMin || !repMax) throw new Error(`Faltan series/repeticiones en un ejercicio del día "${d.name}".`)

      if (typeof e.exerciseId === 'string' && e.exerciseId.trim()) {
        if (!getExercise(e.exerciseId)) {
          throw new Error(`El ejercicio "${e.exerciseId}" no existe en tu biblioteca. Pídele a la IA que use un id del catálogo que le pasaste, o que lo proponga como "newExercise".`)
        }
        return { exerciseId: e.exerciseId, targetSets, repMin, repMax }
      }

      if (e.newExercise && typeof e.newExercise === 'object') {
        const ne = e.newExercise as Record<string, unknown>
        const name = typeof ne.name === 'string' ? ne.name.trim() : ''
        if (!name) throw new Error(`Un "newExercise" del día "${d.name}" no tiene nombre.`)
        const equipment = VALID_EQUIPMENT.includes(ne.equipment as Equipment) ? (ne.equipment as Equipment) : 'machine'
        const logType = VALID_LOGTYPE.includes(ne.logType as ExerciseLogType) ? (ne.logType as ExerciseLogType) : 'weight-reps'
        const muscles = Array.isArray(ne.muscles) ? (ne.muscles as unknown[]).filter((m): m is Muscle => VALID_MUSCLE.includes(m as Muscle)) : []
        return { newExercise: { name, muscles: muscles.length ? muscles : ['core'], equipment, logType }, targetSets, repMin, repMax }
      }

      throw new Error(`Un ejercicio del día "${d.name}" no tiene "exerciseId" ni "newExercise".`)
    })

    return { name: d.name.trim(), exercises: exercisesOut }
  })

  return { routineName: obj.routineName.trim(), summary: typeof obj.summary === 'string' ? obj.summary : undefined, days }
}

// Crea la Routine real (y cualquier ejercicio nuevo que la IA haya propuesto)
// a partir de una propuesta ya validada por parseAiRoutineProposal.
export function applyAiRoutineProposal(proposal: AiRoutineProposal): Routine {
  const now = new Date().toISOString()
  const days: RoutineDay[] = proposal.days.map((day, i) => ({
    id: newId('day'),
    name: day.name,
    order: i + 1,
    color: colorForDayIndex(i),
    exercises: day.exercises.map((item, j) => {
      let exerciseId = item.exerciseId
      if (!exerciseId && item.newExercise) {
        const created = addCustomExercise({
          name: item.newExercise.name,
          section: 'main',
          mainMuscles: item.newExercise.muscles,
          equipment: item.newExercise.equipment,
          logType: item.newExercise.logType,
        })
        exerciseId = created.id
      }
      return {
        id: newId('slot'),
        exerciseId: exerciseId!,
        order: j + 1,
        targetSets: item.targetSets,
        repMin: item.repMin,
        repMax: item.repMax,
      }
    }),
  }))
  return { id: newId('routine'), name: proposal.routineName, days, createdAt: now, updatedAt: now }
}
