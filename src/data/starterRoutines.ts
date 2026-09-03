import type { Routine, RoutineDay } from '../types'
import { newId } from '../lib/id'
import { colorForDayIndex } from '../lib/color'
import { routineTemplates, routineSequence } from './routines'
import { supabase } from './supabaseClient'

export interface BlueprintItem {
  exerciseId: string
  targetSets: number
  repMin: number
  repMax: number
}

export interface DayBlueprint {
  name: string
  items: BlueprintItem[]
}

export interface RoutineBlueprint {
  id: string
  name: string
  days: DayBlueprint[]
  minDays?: number
  maxDays?: number
}

function item(exerciseId: string, targetSets: number, repMin: number, repMax: number): BlueprintItem {
  return { exerciseId, targetSets, repMin, repMax }
}

const pushPullLegs: RoutineBlueprint = {
  id: 'starter-ppl',
  name: 'Push Pull Legs',
  // El "pool" completo son los 5 días clásicos (Push A/Pull A/Pierna/Push B/Pull B);
  // con menos días se usan los primeros N, así 3 días sigue siendo un ciclo
  // completo Push-Pull-Pierna y no una versión recortada rara.
  minDays: 3,
  maxDays: 5,
  days: routineSequence.map((templateId) => {
    const template = routineTemplates.find((t) => t.id === templateId)!
    return {
      name: template.name,
      items: template.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((i) => item(i.exerciseId, i.targetSets, i.repMin, i.repMax)),
    }
  }),
}

const upperLower: RoutineBlueprint = {
  id: 'starter-upper-lower',
  name: 'Torso / Pierna',
  days: [
    {
      name: 'Torso A',
      items: [
        item('press-banca-barra', 3, 6, 10),
        item('remo-t', 3, 8, 12),
        item('press-militar-mancuernas', 2, 8, 12),
        item('jalon-neutro', 2, 8, 12),
        item('elevaciones-laterales', 3, 12, 20),
        item('curl-ez-pie', 2, 8, 12),
      ],
    },
    {
      name: 'Pierna A',
      items: [
        item('sentadilla', 3, 6, 10),
        item('peso-muerto-rumano', 3, 8, 12),
        item('extension-cuadriceps', 2, 10, 15),
        item('curl-femoral-sentado', 3, 10, 15),
        item('gemelos-maquina', 3, 10, 20),
      ],
    },
    {
      name: 'Torso B',
      items: [
        item('press-inclinado-mancuernas', 3, 8, 12),
        item('remo-sentado-polea', 3, 8, 12),
        item('fondos-pecho', 3, 6, 10),
        item('face-pull', 2, 12, 20),
        item('curl-martillo', 2, 10, 15),
        item('extension-triceps-polea', 2, 10, 15),
      ],
    },
    {
      name: 'Pierna B',
      items: [
        item('prensa', 3, 8, 12),
        item('rdl-mancuernas', 3, 8, 12),
        item('extension-cuadriceps-unilateral', 2, 10, 15),
        item('curl-femoral-tumbado', 3, 10, 15),
        item('gemelos-prensa', 3, 10, 20),
      ],
    },
  ],
}

const fullBody1Day: RoutineBlueprint = {
  id: 'starter-full-body-1',
  name: 'Full Body Exprés (1 día)',
  days: [
    {
      name: 'Full Body',
      items: [
        item('sentadilla', 3, 6, 10),
        item('press-banca-barra', 3, 6, 10),
        item('remo-t', 3, 8, 12),
        item('press-militar-mancuernas', 2, 8, 12),
        item('curl-femoral-sentado', 2, 10, 15),
        item('elevaciones-laterales', 2, 12, 20),
        item('curl-ez-pie', 2, 8, 12),
      ],
    },
  ],
}

const fullBody2Day: RoutineBlueprint = {
  id: 'starter-full-body-2',
  name: 'Full Body (2 días)',
  days: [
    {
      name: 'Full Body A',
      items: [
        item('sentadilla', 3, 6, 10),
        item('press-banca-barra', 3, 6, 10),
        item('remo-t', 3, 8, 12),
        item('press-militar-mancuernas', 2, 8, 12),
        item('curl-ez-pie', 2, 8, 12),
      ],
    },
    {
      name: 'Full Body B',
      items: [
        item('peso-muerto-rumano', 3, 8, 12),
        item('press-inclinado-mancuernas', 3, 8, 12),
        item('jalon-neutro', 3, 8, 12),
        item('elevaciones-laterales', 2, 12, 20),
        item('extension-triceps-polea', 2, 10, 15),
      ],
    },
  ],
}

const fullBody: RoutineBlueprint = {
  id: 'starter-full-body',
  name: 'Full Body',
  days: [
    {
      name: 'Full Body A',
      items: [
        item('sentadilla', 3, 6, 10),
        item('press-banca-barra', 3, 6, 10),
        item('remo-t', 3, 8, 12),
        item('elevaciones-laterales', 2, 12, 20),
        item('curl-ez-pie', 2, 8, 12),
      ],
    },
    {
      name: 'Full Body B',
      items: [
        item('peso-muerto-rumano', 3, 8, 12),
        item('press-militar-mancuernas', 3, 8, 12),
        item('jalon-neutro', 3, 8, 12),
        item('extension-triceps-polea', 2, 10, 15),
        item('gemelos-maquina', 3, 10, 20),
      ],
    },
    {
      name: 'Full Body C',
      items: [
        item('prensa', 3, 8, 12),
        item('press-inclinado-mancuernas', 3, 8, 12),
        item('remo-sentado-polea', 3, 8, 12),
        item('face-pull', 2, 12, 20),
        item('curl-martillo', 2, 10, 15),
      ],
    },
  ],
}

const broSplit: RoutineBlueprint = {
  id: 'starter-bro-split',
  name: 'Bro Split',
  days: [
    {
      name: 'Pecho',
      items: [
        item('press-banca-barra', 3, 6, 10),
        item('press-inclinado-mancuernas', 3, 8, 12),
        item('aperturas-polea', 2, 10, 15),
        item('fondos-pecho', 3, 6, 10),
        item('pec-deck', 2, 10, 15),
      ],
    },
    {
      name: 'Espalda',
      items: [
        item('dominadas', 3, 3, 6),
        item('remo-t', 3, 8, 12),
        item('jalon-neutro', 2, 8, 12),
        item('pullover-polea', 2, 10, 15),
        item('remo-sentado-polea', 3, 8, 12),
      ],
    },
    {
      name: 'Pierna',
      items: [
        item('sentadilla', 3, 6, 10),
        item('peso-muerto-rumano', 3, 8, 12),
        item('extension-cuadriceps', 2, 10, 15),
        item('curl-femoral-sentado', 3, 10, 15),
        item('gemelos-maquina', 3, 10, 20),
      ],
    },
    {
      name: 'Hombro',
      items: [
        item('press-militar-mancuernas', 3, 8, 12),
        item('elevaciones-laterales', 3, 12, 20),
        item('face-pull', 3, 12, 20),
        item('pajaros-mancuerna', 2, 12, 20),
      ],
    },
    {
      name: 'Brazos',
      items: [
        item('curl-ez-pie', 3, 8, 12),
        item('curl-martillo', 2, 10, 15),
        item('extension-triceps-polea', 3, 10, 15),
        item('press-frances-ez', 2, 8, 12),
        item('triceps-cuerda', 2, 10, 15),
      ],
    },
  ],
}

// Catálogo local: se usa cuando no hay Supabase configurado, o si la consulta
// a la tabla `routine_templates` falla — así el catálogo nunca se queda vacío.
export const starterRoutineBlueprints: RoutineBlueprint[] = [
  fullBody1Day,
  fullBody2Day,
  pushPullLegs,
  upperLower,
  fullBody,
  broSplit,
]

interface RoutineTemplateRow {
  id: string
  name: string
  min_days: number | null
  max_days: number | null
  days: DayBlueprint[]
}

// Las plantillas predefinidas viven en la tabla `routine_templates` de Supabase
// para poder añadir o editar una sin tocar código ni desplegar — ver
// scratchpad/seed_templates.sql para el esquema y la semilla inicial.
export async function fetchStarterRoutineBlueprints(): Promise<RoutineBlueprint[]> {
  if (!supabase) return starterRoutineBlueprints
  const { data, error } = await supabase
    .from('routine_templates')
    .select('id, name, min_days, max_days, days')
    .order('sort_order', { ascending: true })
  if (error || !data || data.length === 0) return starterRoutineBlueprints
  return (data as RoutineTemplateRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    minDays: row.min_days ?? undefined,
    maxDays: row.max_days ?? undefined,
    days: row.days,
  }))
}

export function instantiateStarterRoutine(blueprint: RoutineBlueprint, dayCount?: number): Routine {
  const now = new Date().toISOString()
  const chosenDays = dayCount ? blueprint.days.slice(0, dayCount) : blueprint.days
  const days: RoutineDay[] = chosenDays.map((day, i) => ({
    id: newId('day'),
    name: day.name,
    order: i + 1,
    color: colorForDayIndex(i),
    exercises: day.items.map((it, j) => ({
      id: newId('slot'),
      exerciseId: it.exerciseId,
      order: j + 1,
      targetSets: it.targetSets,
      repMin: it.repMin,
      repMax: it.repMax,
    })),
  }))
  return { id: newId('routine'), name: blueprint.name, days, createdAt: now, updatedAt: now }
}
