import { loadItem, saveItem, STORAGE_KEYS } from './storage'

// Peso de barra que el usuario ha corregido para un ejercicio concreto (su
// barra Z real, la Smith de su gym, etc.) — solo hace falta guardarlo una vez
// por ejercicio, no por sesión.
function loadAll(): Record<string, number> {
  return loadItem(STORAGE_KEYS.barWeights, {})
}

export function getBarWeightOverride(exerciseId: string): number | undefined {
  return loadAll()[exerciseId]
}

export function setBarWeightOverride(exerciseId: string, kg: number): void {
  const all = loadAll()
  all[exerciseId] = kg
  saveItem(STORAGE_KEYS.barWeights, all)
}
