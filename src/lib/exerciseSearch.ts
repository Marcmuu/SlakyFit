import type { Exercise } from '../types'
import { equipmentLabels } from './equipmentLabels'

const MUSCLE_SYNONYMS: Record<string, string[]> = {
  core: ['ab', 'abs', 'abdomen', 'abdominal', 'abdominales', 'core'],
  pecho: ['pecho', 'pectoral', 'pectorales', 'chest'],
  espalda: ['espalda', 'dorsal', 'dorsales', 'back', 'lumbar'],
  hombro: ['hombro', 'hombros', 'deltoide', 'deltoides', 'shoulder'],
  biceps: ['biceps', 'bicep'],
  triceps: ['triceps', 'tricep'],
  cuadriceps: ['cuadriceps', 'cuadricep', 'pierna', 'piernas', 'quad', 'quads'],
  isquios: ['isquios', 'isquiotibiales', 'femoral', 'femorales', 'pierna', 'piernas'],
  gluteo: ['gluteo', 'gluteos', 'culo', 'pierna', 'piernas'],
  gemelos: ['gemelos', 'pantorrilla', 'pantorrillas', 'calf', 'calves', 'pierna', 'piernas'],
  antebrazo: ['antebrazo', 'antebrazos', 'forearm'],
}

const SHARED_MUSCLE_SYNONYMS: Record<string, string[]> = {
  biceps: ['brazo', 'brazos'],
  triceps: ['brazo', 'brazos'],
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// Matches palabra por palabra: cada palabra de la búsqueda debe ser prefijo de
// alguna palabra del texto (en cualquier orden), así "press banca" encuentra
// "Press banca con barra" y "press militar" encuentra sus variantes, no solo
// búsquedas de una palabra como "ab" -> "Abducción...".
function prefixMatches(haystack: string, query: string): boolean {
  const haystackWords = normalize(haystack).split(/[^a-z0-9]+/).filter(Boolean)
  const queryWords = query.split(/\s+/).filter(Boolean)
  if (queryWords.length === 0) return true
  return queryWords.every((qw) => haystackWords.some((word) => word.startsWith(qw)))
}

function aliasMatches(query: string, aliases: string[]): boolean {
  return aliases.some((alias) => {
    const norm = normalize(alias)
    return norm.startsWith(query) || query.startsWith(norm)
  })
}

export function matchesExerciseQuery(exercise: Exercise, rawQuery: string): boolean {
  const query = normalize(rawQuery)
  if (!query) return true

  if (prefixMatches(exercise.name, query)) return true
  if (prefixMatches(equipmentLabels[exercise.equipment], query)) return true

  for (const muscle of exercise.mainMuscles) {
    if (prefixMatches(muscle, query)) return true
    const synonyms = MUSCLE_SYNONYMS[muscle]
    if (synonyms && aliasMatches(query, synonyms)) return true
    const shared = SHARED_MUSCLE_SYNONYMS[muscle]
    if (shared && aliasMatches(query, shared)) return true
  }

  return false
}

export function searchExercises<T extends Exercise>(list: T[], query: string): T[] {
  if (!query.trim()) return list
  return list.filter((e) => matchesExerciseQuery(e, query))
}
