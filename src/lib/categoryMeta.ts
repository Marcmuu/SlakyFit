import type { Category } from '../types'

export const categoryMeta: Record<Category, { label: string; color: string; textColor: string }> = {
  push: { label: 'Push', color: 'bg-accent-push', textColor: 'text-accent-push' },
  pull: { label: 'Pull', color: 'bg-accent-pull', textColor: 'text-accent-pull' },
  legs: { label: 'Pierna', color: 'bg-accent-legs', textColor: 'text-accent-legs' },
}

export function templateLabel(category: Category, variant: string | null): string {
  const base = categoryMeta[category].label
  return variant ? `${base} ${variant}` : base
}
