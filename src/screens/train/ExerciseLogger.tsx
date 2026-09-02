import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { recommendNextWeight, getLastPerformance, generateWarmup } from '../../data/progression'
import { currentPhase } from '../../lib/programWeek'
import { rirTargetForExercise } from '../../data/phases'
import PageHeader from '../../components/PageHeader'
import ExerciseInfoModal from '../../components/ExerciseInfoModal'
import Card from '../../components/Card'
import Stepper from '../../components/Stepper'
import RIRSelector from '../../components/RIRSelector'
import RestTimer from '../../components/RestTimer'
import Button from '../../components/Button'
import { formatWeight } from '../../lib/format'
import { nearestRirRange } from '../../lib/rir'
import type { RirRange, SetEntry } from '../../types'

export default function ExerciseLogger() {
  const { index } = useParams()
  const idx = Number(index)
  const { activeWorkout, setActiveWorkout, sessions, program } = useAppStore()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  const sessionEx = activeWorkout?.exercises[idx]
  const exercise = sessionEx ? getExercise(sessionEx.exerciseId) : undefined

  const lastPerformance = useMemo(() => (sessionEx ? getLastPerformance(sessionEx.exerciseId, sessions) : undefined), [sessionEx, sessions])

  const recommendation = useMemo(() => {
    if (!sessionEx || !exercise) return undefined
    return recommendNextWeight(sessionEx.exerciseId, sessions, sessionEx.repMin, sessionEx.repMax, 1, exercise.weightIncrement)
  }, [sessionEx, exercise, sessions])

  const phase = program ? currentPhase(program) : undefined
  const rirTarget = phase && exercise ? rirTargetForExercise(phase, exercise.type) : undefined

  const isFirstCompound = activeWorkout
    ? activeWorkout.exercises.findIndex((e) => getExercise(e.exerciseId)?.type === 'compound-main') === idx
    : false
  const warmup = exercise && recommendation?.recommendedWeight ? generateWarmup(recommendation.recommendedWeight, exercise.type, isFirstCompound) : []

  const defaultWeight = sessionEx?.sets.length
    ? sessionEx.sets[sessionEx.sets.length - 1].weight
    : recommendation?.recommendedWeight ?? lastPerformance?.sets[0]?.weight ?? 20
  const defaultReps = sessionEx?.sets.length ? sessionEx.sets[sessionEx.sets.length - 1].reps : lastPerformance?.sets[0]?.reps ?? sessionEx?.repMin ?? 8
  const defaultRir: RirRange = sessionEx?.sets.length
    ? sessionEx.sets[sessionEx.sets.length - 1].rir
    : nearestRirRange(rirTarget ? (rirTarget[0] + rirTarget[1]) / 2 : 2)

  const [weight, setWeight] = useState(defaultWeight)
  const [reps, setReps] = useState(defaultReps)
  const [rir, setRir] = useState<RirRange>(defaultRir)
  const [restTrigger, setRestTrigger] = useState(0)

  if (!activeWorkout || !sessionEx || !exercise) {
    return (
      <div>
        <PageHeader title="Ejercicio" onBack />
        <p className="px-4 text-base-400">No se encontró el ejercicio en la sesión actual.</p>
      </div>
    )
  }

  function saveSet() {
    const entry: SetEntry = { weight, reps, rir }
    const exercises = [...activeWorkout!.exercises]
    exercises[idx] = { ...exercises[idx], sets: [...exercises[idx].sets, entry] }
    setActiveWorkout({ ...activeWorkout!, exercises })
    setRestTrigger((t) => t + 1)
  }

  function removeLastSet() {
    const exercises = [...activeWorkout!.exercises]
    exercises[idx] = { ...exercises[idx], sets: exercises[idx].sets.slice(0, -1) }
    setActiveWorkout({ ...activeWorkout!, exercises })
  }

  const setNumber = sessionEx.sets.length + 1

  return (
    <div className="pb-10">
      <PageHeader
        title={exercise.name}
        onBack={() => navigate('/train/session')}
        right={
          <button
            onClick={() => setInfoOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-base-800 text-base-300 active:bg-base-700 shrink-0"
            aria-label="Ver información del ejercicio"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5" strokeLinecap="round" />
              <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </button>
        }
      />
      {infoOpen && <ExerciseInfoModal exercise={exercise} onClose={() => setInfoOpen(false)} />}
      <div className="px-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs text-base-500 mb-1">Objetivo de hoy</p>
            <p className="font-bold text-base-100 tabular">
              {sessionEx.targetSets} × {sessionEx.repMin}-{sessionEx.repMax}
            </p>
            {rirTarget && <p className="text-xs text-base-500 mt-0.5">RIR objetivo {rirTarget[0]}-{rirTarget[1]}</p>}
          </Card>
          <Card className="p-3">
            <p className="text-xs text-base-500 mb-1">Última vez</p>
            {lastPerformance ? (
              <>
                <p className="font-bold text-base-100 tabular">{formatWeight(lastPerformance.sets[0].weight)} kg</p>
                <p className="text-xs text-base-500 tabular">{lastPerformance.sets.map((s) => s.reps).join(' / ')}</p>
              </>
            ) : (
              <p className="text-sm text-base-500">Sin historial</p>
            )}
          </Card>
        </div>

        {recommendation && (
          <Card className="bg-brand/5 border-brand/30">
            <p className="text-xs text-brand font-semibold mb-1">Recomendación actual</p>
            <p className="text-sm text-base-200">{recommendation.message}</p>
          </Card>
        )}

        {warmup.length > 0 && (
          <Card>
            <p className="text-xs text-base-500 mb-2">Aproximación sugerida (no cuenta como serie efectiva)</p>
            <div className="flex flex-col gap-1">
              {warmup.map((w, i) => (
                <div key={i} className="flex justify-between text-sm text-base-300 tabular">
                  <span>{w.label}</span>
                  <span>{formatWeight(w.weight)} kg × {w.reps}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {sessionEx.sets.length > 0 && (
          <Card>
            <p className="text-xs text-base-500 mb-2">Series de hoy</p>
            <div className="flex flex-col divide-y divide-base-800">
              {sessionEx.sets.map((s, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-sm tabular">
                  <span className="text-base-500">Serie {i + 1}</span>
                  <span className="font-semibold text-base-100">{formatWeight(s.weight)} kg × {s.reps}</span>
                  <span className="text-base-400">RIR {s.rir}</span>
                </div>
              ))}
            </div>
            <button onClick={removeLastSet} className="text-xs text-accent-push mt-2">
              Deshacer última serie
            </button>
          </Card>
        )}

        <RestTimer trigger={restTrigger} />

        <Card className="border-base-700">
          <p className="text-sm font-bold mb-4">SERIE {setNumber}</p>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs text-base-500 mb-2">Peso</p>
              <Stepper
                value={weight}
                onChange={setWeight}
                step={exercise.weightIncrement || 1}
                suffix="kg"
                decimals={weight % 1 !== 0 ? 1 : 0}
                keypadDecimals={1}
                label="Peso"
              />
            </div>
            <div>
              <p className="text-xs text-base-500 mb-2">Repeticiones</p>
              <Stepper value={reps} onChange={setReps} step={1} suffix="reps" label="Repeticiones" />
            </div>
            <div>
              <p className="text-xs text-base-500 mb-2">RIR</p>
              <RIRSelector value={rir} onChange={setRir} />
            </div>
          </div>
          <Button size="lg" className="w-full mt-5" onClick={saveSet}>
            Siguiente serie
          </Button>
        </Card>

        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/train/session')}>
          Volver al entrenamiento
        </Button>
      </div>
    </div>
  )
}
