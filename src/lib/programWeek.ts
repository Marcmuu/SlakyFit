import type { Program, ProgramPhase } from '../types'
import { phaseForWeek } from '../data/phases'

export function currentWeekNumber(program: Program, today = new Date()): number {
  const start = new Date(program.startDate + 'T00:00:00')
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000)
  const week = Math.floor(diffDays / 7) + 1
  return Math.min(Math.max(week, 1), program.durationWeeks)
}

export function currentPhase(program: Program, today = new Date()): ProgramPhase {
  return phaseForWeek(currentWeekNumber(program, today), program.phases)
}
