const STANDARD_BAR_KG = 20

// El peso que registra el usuario es siempre el TOTAL (norma ya usada en todo
// el cálculo de e1RM/progresión) — esto es solo una ayuda visual para saber
// cuánto cargar por lado asumiendo una barra olímpica estándar de 20 kg.
export function perSideWeight(totalWeight: number, barWeight: number = STANDARD_BAR_KG): number | null {
  const perSide = (totalWeight - barWeight) / 2
  if (perSide < 0) return null
  return Math.round(perSide * 10) / 10
}
