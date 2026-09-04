import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getRecommendedDay } from '../../data/recommendation'
import { getExercise } from '../../data/exercises'
import { buildActiveWorkout } from '../../lib/startWorkout'
import { readableTextColor } from '../../lib/color'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function SelectWorkout() {
  const { sessions, setActiveWorkout, activeWorkout, routines, activeRoutineId } = useAppStore()
  const navigate = useNavigate()
  const activeRoutine = routines.find((r) => r.id === activeRoutineId)
  const days = useMemo(() => [...(activeRoutine?.days ?? [])].sort((a, b) => a.order - b.order), [activeRoutine])
  const recommendedDay = useMemo(() => getRecommendedDay(activeRoutine, sessions), [activeRoutine, sessions])
  const [dayId, setDayId] = useState<string | undefined>(recommendedDay?.id)

  const selectedDay = days.find((d) => d.id === dayId) ?? recommendedDay ?? days[0]

  if (!activeRoutine || days.length === 0) {
    return (
      <div>
        <PageHeader title="Entrenar" subtitle="Todavía no tienes una rutina activa" />
        <div className="px-4">
          <Card className="mb-4">
            <p className="text-sm text-base-400">Crea una rutina con tus días y ejercicios para poder empezar a entrenar.</p>
          </Card>
          <Button size="lg" className="w-full" onClick={() => navigate('/routines')}>
            Ir a Mis rutinas
          </Button>
        </div>
      </div>
    )
  }

  function start() {
    if (activeWorkout) {
      navigate('/train/session')
      return
    }
    if (!selectedDay) return
    setActiveWorkout(buildActiveWorkout(activeRoutine!, selectedDay))
    navigate('/train/session')
  }

  return (
    <div>
      <PageHeader title="Entrenar" subtitle={activeRoutine.name} />
      <div className="px-4">
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {days.map((d) => {
            const isSelected = selectedDay?.id === d.id
            return (
              <button
                key={d.id}
                onClick={() => setDayId(d.id)}
                className={`shrink-0 h-11 px-4 rounded-xl text-sm font-semibold border relative ${
                  isSelected ? '' : 'border-base-700 text-base-300'
                }`}
                style={isSelected ? { background: d.color, borderColor: d.color, color: readableTextColor(d.color) } : undefined}
              >
                {d.name}
                {d.id === recommendedDay?.id && !isSelected && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-brand text-base-950 rounded-full px-1.5 py-0.5">
                    Rec.
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <Card className="mb-4">
          <p className="text-sm text-base-400 mb-3">Ejercicios de la sesión</p>
          <div className="flex flex-col divide-y divide-base-800">
            {selectedDay?.exercises
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const exercise = getExercise(item.exerciseId)
                if (!exercise) return null
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-2">
                    <span className="font-medium text-base-100 flex-1 min-w-0 truncate">{exercise.name}</span>
                    <span className="text-xs text-base-500 tabular shrink-0 whitespace-nowrap">
                      {item.targetSets} × {item.repMin}-{item.repMax}
                      {exercise.logType === 'time' ? 's' : ''}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>

        <Button size="lg" className="w-full" onClick={start}>
          {activeWorkout ? 'Continuar entreno en curso' : `Empezar ${selectedDay?.name ?? ''}`}
        </Button>
      </div>
    </div>
  )
}
