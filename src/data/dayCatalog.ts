import type { DayBlueprint } from './starterRoutines'
import { pushPullLegs, fullBody, upperLower, broSplit } from './starterRoutines'

export type DayCategory = 'push' | 'pull' | 'legs' | 'full-body' | 'upper' | 'lower' | 'chest' | 'back' | 'shoulders' | 'arms'

export const CATEGORY_LABELS: Record<DayCategory, string> = {
  push: 'Empuje (Push)',
  pull: 'Tirón (Pull)',
  legs: 'Pierna',
  'full-body': 'Full Body',
  upper: 'Torso',
  lower: 'Pierna (Torso/Pierna)',
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombro',
  arms: 'Brazos',
}

export const CATEGORY_ORDER: DayCategory[] = ['push', 'pull', 'legs', 'full-body', 'upper', 'lower', 'chest', 'back', 'shoulders', 'arms']

export interface CatalogDay {
  id: string
  category: DayCategory
  blueprint: DayBlueprint
}

// Catálogo plano de "días sueltos" para montar una rutina eligiendo tipo por
// tipo (Push A + Pull A, Full Body A + C, etc.) en vez de una plantilla
// completa fija. Se nutre de los mismos días ya definidos en las plantillas
// de starterRoutines.ts, evitando duplicar listas de ejercicios.
export const dayCatalog: CatalogDay[] = [
  { id: 'ppl-push-a', category: 'push', blueprint: pushPullLegs.days[0] },
  { id: 'ppl-pull-a', category: 'pull', blueprint: pushPullLegs.days[1] },
  { id: 'ppl-legs', category: 'legs', blueprint: pushPullLegs.days[2] },
  { id: 'ppl-push-b', category: 'push', blueprint: pushPullLegs.days[3] },
  { id: 'ppl-pull-b', category: 'pull', blueprint: pushPullLegs.days[4] },
  { id: 'fb-a', category: 'full-body', blueprint: fullBody.days[0] },
  { id: 'fb-b', category: 'full-body', blueprint: fullBody.days[1] },
  { id: 'fb-c', category: 'full-body', blueprint: fullBody.days[2] },
  { id: 'ul-upper-a', category: 'upper', blueprint: upperLower.days[0] },
  { id: 'ul-lower-a', category: 'lower', blueprint: upperLower.days[1] },
  { id: 'ul-upper-b', category: 'upper', blueprint: upperLower.days[2] },
  { id: 'ul-lower-b', category: 'lower', blueprint: upperLower.days[3] },
  { id: 'bro-chest', category: 'chest', blueprint: broSplit.days[0] },
  { id: 'bro-back', category: 'back', blueprint: broSplit.days[1] },
  { id: 'bro-shoulders', category: 'shoulders', blueprint: broSplit.days[3] },
  { id: 'bro-arms', category: 'arms', blueprint: broSplit.days[4] },
]
