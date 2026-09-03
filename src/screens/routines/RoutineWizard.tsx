import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import { getExercise } from '../../data/exercises'
import { fetchStarterRoutineBlueprints, instantiateStarterRoutine } from '../../data/starterRoutines'
import type { RoutineBlueprint } from '../../data/starterRoutines'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { Routine } from '../../types'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MIN_DAYS = 1

export default function RoutineWizard() {
  const { routines, addRoutine, setActiveRoutineId } = useAppStore()
  const navigate = useNavigate()
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set())
  const [blueprints, setBlueprints] = useState<RoutineBlueprint[] | null>(null)
  const [preview, setPreview] = useState<{ blueprint: RoutineBlueprint; dayCount?: number } | null>(null)

  useEffect(() => {
    fetchStarterRoutineBlueprints().then(setBlueprints)
  }, [])

  const dayCount = selectedDays.size

  function toggleDay(i: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function isFlexible(b: RoutineBlueprint) {
    return b.minDays !== undefined && b.maxDays !== undefined
  }

  function isCompatible(b: RoutineBlueprint): boolean {
    if (isFlexible(b)) return dayCount >= b.minDays! && dayCount <= b.maxDays!
    return b.days.length === dayCount
  }

  const compatible = blueprints?.filter(isCompatible) ?? []
  const others = blueprints?.filter((b) => !isCompatible(b)) ?? []

  function openPreview(blueprint: RoutineBlueprint) {
    setPreview({ blueprint, dayCount: isFlexible(blueprint) ? dayCount : undefined })
  }

  function confirmPreview() {
    if (!preview) return
    const routine = instantiateStarterRoutine(preview.blueprint, preview.dayCount)
    addRoutine(routine)
    setActiveRoutineId(routine.id)
    navigate(`/routines/${routine.id}`)
  }

  function createFromScratch() {
    const now = new Date().toISOString()
    const routine: Routine = { id: newId('routine'), name: `Rutina ${routines.length + 1}`, days: [], createdAt: now, updatedAt: now }
    addRoutine(routine)
    setActiveRoutineId(routine.id)
    navigate(`/routines/${routine.id}`)
  }

  if (preview) {
    const previewDays = preview.dayCount ? preview.blueprint.days.slice(0, preview.dayCount) : preview.blueprint.days
    return (
      <div className="pb-8">
        <PageHeader title={preview.blueprint.name} subtitle="Revisa los días antes de guardarla" onBack={() => setPreview(null)} />
        <div className="px-4 flex flex-col gap-3">
          {previewDays.map((day, i) => (
            <Card key={i}>
              <p className="font-bold text-base-100 mb-2">{day.name}</p>
              <ul className="flex flex-col gap-1">
                {day.items.map((it, j) => {
                  const exercise = getExercise(it.exerciseId)
                  return (
                    <li key={j} className="text-sm text-base-400 flex items-center justify-between">
                      <span>{exercise?.name ?? it.exerciseId}</span>
                      <span className="text-xs text-base-500 shrink-0">
                        {it.targetSets}×{it.repMin}-{it.repMax}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
          <Button size="lg" className="w-full mt-1" onClick={confirmPreview}>
            Guardar rutina
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => setPreview(null)}>
            Elegir otra
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <PageHeader title="Crear rutina" subtitle="Elige tus días y te sugerimos una rutina" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold mb-1">¿Qué días quieres entrenar?</p>
          <p className="text-xs text-base-500 mb-3">Toca los días que te vengan bien, aunque sea solo uno.</p>
          <div className="flex justify-between gap-1.5">
            {WEEKDAYS.map((label, i) => {
              const selected = selectedDays.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-sm font-bold border ${
                    selected ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-400'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-base-500 mt-3 text-center">
            {dayCount === 0
              ? 'Todavía no has elegido ningún día'
              : `Entrenas ${dayCount} día${dayCount === 1 ? '' : 's'} a la semana`}
          </p>
        </Card>

        {dayCount >= MIN_DAYS && (
          <>
            {!blueprints && <p className="text-sm text-base-500 text-center py-4">Cargando plantillas…</p>}

            {blueprints && compatible.length > 0 && (
              <div>
                <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Compatibles con {dayCount} días</p>
                <div className="flex flex-col gap-2">
                  {compatible.map((b) => (
                    <button key={b.id} onClick={() => openPreview(b)} className="text-left">
                      <Card className="active:bg-base-800">
                        <p className="font-semibold text-base-100">{b.name}</p>
                        <p className="text-xs text-base-500 mt-0.5">{b.days.slice(0, dayCount).map((d) => d.name).join(' · ')}</p>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {blueprints && compatible.length === 0 && (
              <Card className="text-center py-6">
                <p className="text-sm text-base-400">Ninguna plantilla encaja exactamente con {dayCount} días. Prueba otro número, o mira las de abajo.</p>
              </Card>
            )}

            {blueprints && others.length > 0 && (
              <div>
                <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Otras plantillas</p>
                <div className="flex flex-col gap-2">
                  {others.map((b) => (
                    <button key={b.id} onClick={() => openPreview(b)} className="text-left">
                      <Card className="active:bg-base-800">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-base-100">{b.name}</p>
                          <span className="text-xs text-base-500 tabular shrink-0">
                            {isFlexible(b) ? `${b.minDays}-${b.maxDays} días` : `${b.days.length} días`}
                          </span>
                        </div>
                        <p className="text-xs text-base-500 mt-0.5">{b.days.map((d) => d.name).join(' · ')}</p>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Button variant="secondary" size="lg" className="w-full" onClick={createFromScratch}>
          Prefiero crear la mía desde cero
        </Button>
      </div>
    </div>
  )
}
