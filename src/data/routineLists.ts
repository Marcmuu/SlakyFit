import type { RoutineList } from '../types'

export const routineLists: RoutineList[] = [
  {
    id: 'abs-rapido',
    name: 'ABS rápido',
    section: 'abs',
    durationLabel: '5 min',
    exerciseIds: ['plancha', 'crunch-polea'],
  },
  {
    id: 'abs-a',
    name: 'ABS A',
    section: 'abs',
    durationLabel: '10 min',
    exerciseIds: ['plancha', 'crunch-polea', 'elevacion-piernas-colgado'],
  },
  {
    id: 'abs-b',
    name: 'ABS B',
    section: 'abs',
    durationLabel: '10 min',
    exerciseIds: ['rueda-abdominal', 'crunch-maquina', 'oblicuo-polea'],
  },
  {
    id: 'core-estabilidad',
    name: 'Core estabilidad',
    section: 'abs',
    durationLabel: '8 min',
    exerciseIds: ['plancha', 'oblicuo-polea'],
  },
  {
    id: 'core-con-peso',
    name: 'Core con peso',
    section: 'abs',
    durationLabel: '10 min',
    exerciseIds: ['crunch-polea', 'crunch-maquina', 'oblicuo-polea'],
  },
  {
    id: 'movilidad-antes-push',
    name: 'Antes de Push',
    section: 'mobility',
    durationLabel: '5 min',
    exerciseIds: ['movilidad-hombro-circulos', 'movilidad-toracica'],
    usedBefore: 'push',
  },
  {
    id: 'movilidad-antes-pull',
    name: 'Antes de Pull',
    section: 'mobility',
    durationLabel: '5 min',
    exerciseIds: ['movilidad-toracica', 'movilidad-columna-gato-camello'],
    usedBefore: 'pull',
  },
  {
    id: 'movilidad-antes-pierna',
    name: 'Antes de Pierna',
    section: 'mobility',
    durationLabel: '6 min',
    exerciseIds: ['movilidad-cadera-90-90', 'movilidad-tobillo'],
    usedBefore: 'legs',
  },
  {
    id: 'movilidad-cuerpo-completo',
    name: 'Movilidad cuerpo completo',
    section: 'mobility',
    durationLabel: '10 min',
    exerciseIds: ['movilidad-hombro-circulos', 'movilidad-toracica', 'movilidad-cadera-90-90', 'movilidad-tobillo', 'movilidad-columna-gato-camello'],
  },
  {
    id: 'flex-cuerpo-completo',
    name: 'Cuerpo completo',
    section: 'flexibility',
    durationLabel: '8 min',
    exerciseIds: ['estiramiento-pecho-puerta', 'estiramiento-isquios-pie', 'estiramiento-cuadriceps-pie', 'estiramiento-dorsal-colgado'],
  },
  {
    id: 'flex-piernas',
    name: 'Piernas',
    section: 'flexibility',
    durationLabel: '6 min',
    exerciseIds: ['estiramiento-isquios-pie', 'estiramiento-cuadriceps-pie', 'estiramiento-flexor-cadera'],
  },
  {
    id: 'flex-cadera',
    name: 'Cadera',
    section: 'flexibility',
    durationLabel: '5 min',
    exerciseIds: ['estiramiento-gluteo-figura4', 'estiramiento-flexor-cadera'],
  },
  {
    id: 'flex-pecho-hombros',
    name: 'Pecho / Hombros',
    section: 'flexibility',
    durationLabel: '5 min',
    exerciseIds: ['estiramiento-pecho-puerta', 'estiramiento-dorsal-colgado'],
  },
  {
    id: 'flex-postentreno',
    name: 'Postentreno',
    section: 'flexibility',
    durationLabel: '6 min',
    exerciseIds: ['estiramiento-isquios-pie', 'estiramiento-pecho-puerta', 'estiramiento-gluteo-figura4'],
  },
]

export function getRoutineList(id: string): RoutineList | undefined {
  return routineLists.find((r) => r.id === id)
}
