import type { ActiveWorkout, Routine, RoutineDay } from '../types'

export function buildActiveWorkout(routine: Routine, day: RoutineDay): ActiveWorkout {
  return {
    routineId: routine.id,
    dayId: day.id,
    dayName: day.name,
    dayColor: day.color,
    startedAt: new Date().toISOString(),
    exercises: day.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        exerciseId: item.exerciseId,
        order: item.order,
        isExtra: false,
        targetSets: item.targetSets,
        repMin: item.repMin,
        repMax: item.repMax,
        sets: [],
      })),
  }
}
