import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getRecommendedTemplateId } from '../../data/recommendation'
import { templatesForCategory, getRoutineTemplate } from '../../data/routines'
import { getExercise } from '../../data/exercises'
import { categoryMeta, templateLabel } from '../../lib/categoryMeta'
import { buildActiveWorkout } from '../../lib/startWorkout'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { Category } from '../../types'

export default function SelectWorkout() {
  const { sessions, setActiveWorkout, activeWorkout } = useAppStore()
  const navigate = useNavigate()
  const recommendedId = useMemo(() => getRecommendedTemplateId(sessions), [sessions])
  const recommendedTemplate = getRoutineTemplate(recommendedId)!
  const [category, setCategory] = useState<Category>(recommendedTemplate.category)
  const [templateId, setTemplateId] = useState<string>(recommendedId)

  const options = templatesForCategory(category)
  const selected = getRoutineTemplate(templateId) ?? options[0]

  function handleSelectCategory(cat: Category) {
    setCategory(cat)
    const preferred = templatesForCategory(cat).find((t) => t.id === recommendedId) ?? templatesForCategory(cat)[0]
    setTemplateId(preferred.id)
  }

  function start() {
    if (activeWorkout) {
      navigate('/train/session')
      return
    }
    setActiveWorkout(buildActiveWorkout(selected))
    navigate('/train/session')
  }

  return (
    <div>
      <PageHeader title="Entrenar" subtitle="Elige tu entrenamiento de hoy" />
      <div className="px-4">
        <div className="flex gap-2 mb-4">
          {(['push', 'pull', 'legs'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`flex-1 h-12 rounded-xl text-sm font-bold border transition-colors ${
                category === cat ? 'bg-base-100 text-base-950 border-base-100' : 'border-base-700 text-base-300'
              }`}
            >
              {categoryMeta[cat].label}
            </button>
          ))}
        </div>

        {options.length > 1 && (
          <div className="flex gap-2 mb-5">
            {options.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold border relative ${
                  templateId === t.id ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                }`}
              >
                {templateLabel(t.category, t.variant)}
                {t.id === recommendedId && templateId !== t.id && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-brand text-base-950 rounded-full px-1.5 py-0.5">
                    Rec.
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <Card className="mb-4">
          <p className="text-sm text-base-400 mb-3">Ejercicios de la sesión</p>
          <div className="flex flex-col divide-y divide-base-800">
            {selected.items.map((item) => {
              const exercise = getExercise(item.exerciseId)!
              return (
                <div key={item.exerciseId} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-base-100">{exercise.name}</span>
                  <span className="text-xs text-base-500 tabular">
                    {item.targetSets} × {item.repMin}-{item.repMax}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Button size="lg" className="w-full" onClick={start}>
          {activeWorkout ? 'Continuar entrenamiento en curso' : `Empezar ${templateLabel(selected.category, selected.variant)}`}
        </Button>
      </div>
    </div>
  )
}
