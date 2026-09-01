import type { ProgramPhase } from '../types'

export const defaultPhases: ProgramPhase[] = [
  {
    name: 'Reentrada',
    weekStart: 1,
    weekEnd: 2,
    rirTargets: { compoundMain: [3, 3], compoundSecondary: [3, 3], isolation: [2, 3] },
  },
  {
    name: 'Construcción',
    weekStart: 3,
    weekEnd: 4,
    rirTargets: { compoundMain: [2, 2], compoundSecondary: [1, 2], isolation: [1, 2] },
  },
  {
    name: 'Trabajo normal',
    weekStart: 5,
    weekEnd: 6,
    rirTargets: { compoundMain: [1, 2], compoundSecondary: [1, 2], isolation: [0, 2] },
  },
]

export function phaseForWeek(week: number, phases: ProgramPhase[] = defaultPhases): ProgramPhase {
  const found = phases.find((p) => week >= p.weekStart && week <= p.weekEnd)
  return found ?? phases[phases.length - 1]
}

export function rirTargetForExercise(
  phase: ProgramPhase,
  type: 'compound-main' | 'compound-secondary' | 'isolation',
): [number, number] {
  if (type === 'compound-main') return phase.rirTargets.compoundMain
  if (type === 'compound-secondary') return phase.rirTargets.compoundSecondary
  return phase.rirTargets.isolation
}
