import type { ActiveWorkout, RoutineTemplate } from '../types'

export function buildActiveWorkout(template: RoutineTemplate): ActiveWorkout {
  return {
    recommendedTemplateId: template.id,
    category: template.category,
    variant: template.variant,
    startedAt: new Date().toISOString(),
    exercises: template.items
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
