import type { RirRange } from '../types'

export const RIR_MIDPOINT: Record<RirRange, number> = {
  '0-1': 0.5,
  '1-2': 1.5,
  '2-3': 2.5,
  '3+': 4,
}

// Usa el punto medio de cada rango para elegir el bucket más cercano a un
// valor numérico de referencia (p. ej. el RIR objetivo de la fase actual).
export function nearestRirRange(target: number): RirRange {
  let closest: RirRange = '0-1'
  let bestDistance = Infinity
  for (const range of Object.keys(RIR_MIDPOINT) as RirRange[]) {
    const distance = Math.abs(RIR_MIDPOINT[range] - target)
    if (distance < bestDistance) {
      bestDistance = distance
      closest = range
    }
  }
  return closest
}

export function numericRirToRange(value: number): RirRange {
  if (value < 1) return '0-1'
  if (value < 2) return '1-2'
  if (value < 3) return '2-3'
  return '3+'
}
