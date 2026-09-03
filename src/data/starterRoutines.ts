import type { Routine, RoutineDay } from '../types'
import { newId } from '../lib/id'
import { colorForDayIndex } from '../lib/color'
import { routineTemplates, routineSequence } from './routines'

interface BlueprintItem {
  exerciseId: string
  targetSets: number
  repMin: number
  repMax: number
}

interface DayBlueprint {
  name: string
  items: BlueprintItem[]
}

interface RoutineBlueprint {
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

export const starterRoutineBlueprints: RoutineBlueprint[] = [pushPullLegs, upperLower, fullBody, broSplit]

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
