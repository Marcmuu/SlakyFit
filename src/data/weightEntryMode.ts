import { loadItem, saveItem, STORAGE_KEYS } from './storage'
import type { WeightEntryMode } from '../lib/plateCalc'

// Si el usuario prefiere teclear el peso total o solo el disco por lado para
// un ejercicio de barra concreto — se recuerda por ejercicio, no por sesión,
// igual que el peso de la barra (data/barWeights.ts).
function loadAll(): Record<string, WeightEntryMode> {
  return loadItem(STORAGE_KEYS.weightEntryMode, {})
}

export function getWeightEntryMode(exerciseId: string): WeightEntryMode {
  return loadAll()[exerciseId] ?? 'total'
}

export function setWeightEntryMode(exerciseId: string, mode: WeightEntryMode): void {
  const all = loadAll()
  all[exerciseId] = mode
  saveItem(STORAGE_KEYS.weightEntryMode, all)
}
