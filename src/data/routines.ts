import type { RoutineTemplate, RoutineItem } from '../types'

function item(exerciseId: string, order: number, targetSets: number, repMin: number, repMax: number): RoutineItem {
  return { exerciseId, order, targetSets, repMin, repMax }
}

export const routineTemplates: RoutineTemplate[] = [
  {
    id: 'push-a',
    category: 'push',
    variant: 'A',
    name: 'Push A',
    items: [
      item('press-banca-barra', 1, 3, 6, 10),
      item('aperturas-polea', 2, 2, 10, 15),
      item('press-militar-mancuernas', 3, 2, 8, 12),
      item('elevaciones-laterales', 4, 3, 12, 20),
      item('extension-triceps-polea', 5, 2, 10, 15),
      item('extension-triceps-cuerda', 6, 2, 10, 15),
    ],
  },
  {
    id: 'pull-a',
    category: 'pull',
    variant: 'A',
    name: 'Pull A',
    items: [
      item('dominadas', 1, 3, 3, 6),
      item('remo-t', 2, 3, 8, 12),
      item('jalon-pecho', 3, 2, 8, 12),
      item('curl-ez-pie', 4, 2, 8, 12),
      item('curl-martillo', 5, 2, 10, 15),
      item('face-pull', 6, 2, 12, 20),
    ],
  },
  {
    id: 'legs',
    category: 'legs',
    variant: null,
    name: 'Pierna',
    items: [
      item('sentadilla', 1, 3, 6, 10),
      item('peso-muerto-rumano', 2, 3, 8, 12),
      item('extension-cuadriceps', 3, 2, 10, 15),
      item('curl-femoral-sentado', 4, 3, 10, 15),
      item('gemelos-maquina', 5, 3, 10, 20),
    ],
  },
  {
    id: 'push-b',
    category: 'push',
    variant: 'B',
    name: 'Push B',
    items: [
      item('press-inclinado-mancuernas', 1, 3, 8, 12),
      item('fondos-pecho', 2, 3, 6, 10),
      item('pec-deck', 3, 2, 10, 15),
      item('elevaciones-laterales', 4, 3, 12, 20),
      item('press-frances-ez', 5, 2, 8, 12),
      item('triceps-unilateral-polea', 6, 2, 10, 15),
    ],
  },
  {
    id: 'pull-b',
    category: 'pull',
    variant: 'B',
    name: 'Pull B',
    items: [
      item('jalon-neutro', 1, 3, 8, 12),
      item('remo-sentado-polea', 2, 3, 8, 12),
      item('pullover-polea', 3, 2, 10, 15),
      item('curl-inclinado-mancuernas', 4, 3, 8, 12),
      item('curl-martillo', 5, 2, 10, 15),
      item('reverse-pec-deck', 6, 2, 12, 20),
    ],
  },
]

export const routineSequence = ['push-a', 'pull-a', 'legs', 'push-b', 'pull-b']

export function getRoutineTemplate(id: string): RoutineTemplate | undefined {
  return routineTemplates.find((r) => r.id === id)
}

export function templatesForCategory(category: RoutineTemplate['category']): RoutineTemplate[] {
  return routineTemplates.filter((r) => r.category === category)
}
