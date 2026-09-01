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

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// Matches at the start of the whole string or the start of any word inside it,
// so short queries like "ab" find "Abducción..." but not "por la cabeza".
function prefixMatches(haystack: string, query: string): boolean {
  const norm = normalize(haystack)
  return norm.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))
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
  }

  return false
}

export function searchExercises<T extends Exercise>(list: T[], query: string): T[] {
  if (!query.trim()) return list
  return list.filter((e) => matchesExerciseQuery(e, query))
}
