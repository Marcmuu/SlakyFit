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
import { describeSet } from '../../lib/setFormat'
import type { RirRange, SetEntry } from '../../types'

export default function ExerciseLogger() {
  const { index } = useParams()
  const idx = Number(index)
  const { activeWorkout, setActiveWorkout, sessions, program } = useAppStore()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  const sessionEx = activeWorkout?.exercises[idx]
  const exercise = sessionEx ? getExercise(sessionEx.exerciseId) : undefined
  const logType = exercise?.logType ?? 'weight-reps'

  const lastPerformance = useMemo(() => (sessionEx ? getLastPerformance(sessionEx.exerciseId, sessions) : undefined), [sessionEx, sessions])
  const lastSet = lastPerformance?.sets[lastPerformance.sets.length - 1]

  const recommendation = useMemo(() => {
    if (!sessionEx || !exercise) return undefined
    return recommendNextWeight(sessionEx.exerciseId, sessions, sessionEx.repMin, sessionEx.repMax, 1, exercise.weightIncrement)
  }, [sessionEx, exercise, sessions])

  const phase = program ? currentPhase(program) : undefined
  const rirTarget = phase && exercise ? rirTargetForExercise(phase, exercise.type) : undefined

  const isFirstCompound = activeWorkout
    ? activeWorkout.exercises.findIndex((e) => getExercise(e.exerciseId)?.type === 'compound-main') === idx
    : false
  const warmup =
    exercise && logType === 'weight-reps' && recommendation?.recommendedWeight
      ? generateWarmup(recommendation.recommendedWeight, exercise.type, isFirstCompound)
      : []

  const lastSavedSet = sessionEx?.sets[sessionEx.sets.length - 1]

  const defaultWeight = lastSavedSet ? lastSavedSet.weight ?? 20 : recommendation?.recommendedWeight ?? lastSet?.weight ?? 20
  const defaultReps = lastSavedSet ? lastSavedSet.reps ?? 8 : lastSet?.reps ?? sessionEx?.repMin ?? 8
  const defaultExtraWeight = lastSavedSet ? lastSavedSet.extraWeight ?? 0 : lastSet?.extraWeight ?? 0
  const defaultDurationSec = lastSavedSet ? lastSavedSet.durationSec ?? 30 : lastSet?.durationSec ?? exercise?.defaultDurationSec ?? 30
  const defaultRir: RirRange = lastSavedSet ? lastSavedSet.rir : nearestRirRange(rirTarget ? (rirTarget[0] + rirTarget[1]) / 2 : 2)

  const [weight, setWeight] = useState(defaultWeight)
  const [reps, setReps] = useState(defaultReps)
  const [extraWeight, setExtraWeight] = useState(defaultExtraWeight)
  const [durationSec, setDurationSec] = useState(defaultDurationSec)
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
    const entry: SetEntry =
      logType === 'time'
        ? { durationSec, rir }
        : logType === 'bodyweight-reps'
          ? { reps, extraWeight: extraWeight || undefined, rir }
          : { weight, reps, rir }
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
        onBack={() => navigate('/train/session', { replace: true })}
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
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-base-500 uppercase tracking-wide">Recomendación para hoy</p>
            {rirTarget && <span className="text-xs text-base-500 shrink-0 whitespace-nowrap">RIR obj. {rirTarget[0]}-{rirTarget[1]}</span>}
          </div>
          <div className={`grid gap-2 text-center mb-3 ${logType === 'weight-reps' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <p className="text-[10px] text-base-500 uppercase mb-0.5">Series</p>
              <p className="text-lg font-bold tabular text-base-100">{sessionEx.targetSets}</p>
            </div>
            <div>
              <p className="text-[10px] text-base-500 uppercase mb-0.5">{logType === 'time' ? 'Duración' : 'Reps'}</p>
              <p className="text-lg font-bold tabular text-base-100">
                {sessionEx.repMin}-{sessionEx.repMax}
                {logType === 'time' ? 's' : ''}
              </p>
            </div>
            {logType === 'weight-reps' && (
              <div>
                <p className="text-[10px] text-base-500 uppercase mb-0.5">Peso sugerido</p>
                <p className="text-lg font-bold tabular text-brand">
                  {recommendation?.recommendedWeight ? `${formatWeight(recommendation.recommendedWeight)} kg` : '—'}
                </p>
              </div>
            )}
          </div>
          {recommendation && <p className="text-xs text-base-400 pt-3 border-t border-base-800">{recommendation.message}</p>}
        </Card>

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

        <Card className="border-base-700">
          <p className="text-sm font-bold mb-4">SERIE {setNumber}</p>
          <div className="flex flex-col gap-5">
            {logType === 'weight-reps' && (
              <>
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
              </>
            )}

            {logType === 'bodyweight-reps' && (
              <>
                <div>
                  <p className="text-xs text-base-500 mb-2">Repeticiones</p>
                  <Stepper value={reps} onChange={setReps} step={1} suffix="reps" label="Repeticiones" />
                </div>
                <div>
                  <p className="text-xs text-base-500 mb-2">Lastre añadido (opcional)</p>
                  <Stepper value={extraWeight} onChange={setExtraWeight} step={2.5} suffix="kg" decimals={extraWeight % 1 !== 0 ? 1 : 0} keypadDecimals={1} label="Lastre" />
                </div>
              </>
            )}

            {logType === 'time' && (
              <div>
                <p className="text-xs text-base-500 mb-2">Duración mantenida</p>
                <Stepper value={durationSec} onChange={setDurationSec} step={5} min={0} suffix="s" label="Duración" />
              </div>
            )}

            <div>
              <p className="text-xs text-base-500 mb-2">RIR</p>
              <RIRSelector value={rir} onChange={setRir} />
            </div>
          </div>
          <Button size="lg" className="w-full mt-5" onClick={saveSet}>
            Siguiente serie
          </Button>
        </Card>

        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/train/session', { replace: true })}>
          Terminar ejercicio
        </Button>

        <RestTimer trigger={restTrigger} />

        {sessionEx.sets.length > 0 && (
          <Card>
            <p className="text-xs text-base-500 mb-2">Series de hoy</p>
            <div className="flex flex-col divide-y divide-base-800">
              {sessionEx.sets.map((s, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-sm tabular gap-2">
                  <span className="text-base-500 shrink-0">Serie {i + 1}</span>
                  <span className="font-semibold text-base-100 flex-1 text-right">{describeSet(exercise, s)}</span>
                  <span className="text-base-400 shrink-0">RIR {s.rir}</span>
                </div>
              ))}
            </div>
            <button onClick={removeLastSet} className="text-xs text-accent-push mt-2">
              Deshacer última serie
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}
