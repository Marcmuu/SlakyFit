export const STANDARD_BAR_KG = 20

export type WeightEntryMode = 'total' | 'perSide'

// El histórico/progresión/e1RM siempre operan sobre el peso TOTAL — esto es
// solo una ayuda visual para saber cuánto cargar por lado asumiendo una barra
// olímpica estándar de 20 kg (o la que el usuario haya corregido).
export function perSideWeight(totalWeight: number, barWeight: number = STANDARD_BAR_KG): number | null {
  const perSide = (totalWeight - barWeight) / 2
  if (perSide < 0) return null
  return Math.round(perSide * 10) / 10
}

// Convierte lo que el usuario tiene tecleado (en el modo que sea) al peso
// total real, que es lo único que se guarda en el historial.
export function toTotalWeight(value: number, mode: WeightEntryMode, barWeight: number): number {
  return mode === 'total' ? value : Math.round((value * 2 + barWeight) * 10) / 10
}

// Convierte un peso total guardado a lo que tocaría mostrar en el modo actual.
export function fromTotalWeight(total: number, mode: WeightEntryMode, barWeight: number): number {
  if (mode === 'total') return total
  return Math.max(0, Math.round(((total - barWeight) / 2) * 10) / 10)
}
