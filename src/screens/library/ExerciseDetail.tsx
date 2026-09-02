import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { getExerciseHistory, bestSet, bestE1RMForExercise, prForExercise, computeE1RM } from '../../data/progression'
import { formatDayLabel, formatWeight } from '../../lib/format'
import { describeSet, effectiveWeight, effectiveReps } from '../../lib/setFormat'
import PageHeader from '../../components/PageHeader'
import ExerciseMedia, { youtubeSearchUrl } from '../../components/ExerciseMedia'
import Card from '../../components/Card'
import Button from '../../components/Button'
import TrendLineChart from '../../components/charts/TrendLineChart'

const HISTORY_PREVIEW_COUNT = 6

export default function ExerciseDetail() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const { sessions, activeWorkout, setActiveWorkout } = useAppStore()
  const exercise = exerciseId ? getExercise(exerciseId) : undefined
  const [showAllHistory, setShowAllHistory] = useState(false)

  const isTime = exercise?.logType === 'time'
  const history = useMemo(() => (exerciseId ? getExerciseHistory(exerciseId, sessions) : []), [exerciseId, sessions])
  const pr = exerciseId && !isTime ? prForExercise(exerciseId, sessions) : undefined
  const best = !isTime && history[0] ? bestSet(history[0].sets, exercise!) : undefined
  const e1rm = exerciseId && !isTime ? bestE1RMForExercise(exerciseId, sessions) : 0
  const bestDurationSec = isTime ? Math.max(0, ...history.flatMap((h) => h.sets.map((s) => s.durationSec ?? 0))) : 0

  const chartData = useMemo(
    () =>
      !exercise || isTime
        ? []
        : [...history]
            .reverse()
            .map((h) => ({
              x: formatDayLabel(h.date).split(' ')[0],
              y: Math.max(...h.sets.map((s) => computeE1RM(effectiveWeight(exercise, s), effectiveReps(s)))),
            })),
    [history, exercise, isTime],
  )

  if (!exercise) {
    return (
      <div>
        <PageHeader title="Ejercicio" onBack />
      </div>
    )
  }

  function addToWorkout() {
    if (!activeWorkout) return
    const isTimeExercise = exercise!.logType === 'time'
    setActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        {
          exerciseId: exercise!.id,
          order: activeWorkout.exercises.length + 1,
          isExtra: true,
          targetSets: 3,
          repMin: isTimeExercise ? 20 : 8,
          repMax: isTimeExercise ? 40 : 12,
          sets: [],
        },
      ],
    })
    navigate('/train/session')
  }

  return (
    <div className="pb-8">
      <PageHeader title={exercise.name} onBack />
      <div className="px-4 flex flex-col gap-4">
        <ExerciseMedia exercise={exercise} />

        <a
          href={youtubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.5v-7L15.5 12Z" />
          </svg>
          Ver técnica en YouTube
        </a>

        <div className="flex flex-wrap gap-2">
          {exercise.mainMuscles.map((m) => (
            <span key={m} className="text-xs font-semibold text-base-300 bg-base-800 px-2.5 py-1 rounded-full capitalize">
              {m}
            </span>
          ))}
          <span className="text-xs font-semibold text-base-300 bg-base-800 px-2.5 py-1 rounded-full">{exercise.pattern}</span>
        </div>

        {isTime ? (
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3 text-center">
              <p className="text-[10px] text-base-500 uppercase mb-1">Mejor tiempo</p>
              <p className="font-bold tabular">{bestDurationSec ? `${bestDurationSec}s` : '—'}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-[10px] text-base-500 uppercase mb-1">Última vez</p>
              <p className="font-bold tabular">{history[0] ? `${history[0].sets[history[0].sets.length - 1].durationSec ?? 0}s` : '—'}</p>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <p className="text-[10px] text-base-500 uppercase mb-1">Peso actual</p>
                <p className="font-bold tabular">{best ? describeSet(exercise, best) : '—'}</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-[10px] text-base-500 uppercase mb-1">PR</p>
                <p className="font-bold tabular">{pr ? describeSet(exercise, pr) : '—'}</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-[10px] text-base-500 uppercase mb-1">e1RM</p>
                <p className="font-bold tabular">{e1rm ? `${formatWeight(e1rm)} kg` : '—'}</p>
              </Card>
            </div>

            <Card>
              <p className="text-sm font-bold mb-2">Progreso (e1RM)</p>
              <TrendLineChart data={chartData} unit=" kg" />
            </Card>
          </>
        )}

        <Card>
          <p className="text-sm font-bold mb-3">Instrucciones</p>
          <ul className="flex flex-col gap-1.5 text-sm text-base-300 list-disc list-inside">
            {exercise.instructions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-bold mb-3">Errores habituales</p>
          <ul className="flex flex-col gap-1.5 text-sm text-base-300 list-disc list-inside">
            {exercise.mistakes.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-bold mb-3">Consejos</p>
          <ul className="flex flex-col gap-1.5 text-sm text-base-300 list-disc list-inside">
            {exercise.tips.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </Card>

        {exercise.alternativeIds.length > 0 && (
          <Card>
            <p className="text-sm font-bold mb-3">Alternativas</p>
            <div className="flex flex-col gap-2">
              {exercise.alternativeIds.map((id) => {
                const alt = getExercise(id)
                if (!alt) return null
                return (
                  <button key={id} onClick={() => navigate(`/library/${id}`)} className="text-left flex items-center justify-between py-1.5">
                    <span className="text-sm text-base-200 flex-1 min-w-0 truncate pr-2">{alt.name}</span>
                    <span className="text-base-600 shrink-0">›</span>
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <p className="text-sm font-bold mb-3">Historial</p>
            <div className="flex flex-col gap-3">
              {(showAllHistory ? history : history.slice(0, HISTORY_PREVIEW_COUNT)).map((h, i) => (
                <div key={h.date} className={i > 0 ? 'pt-3 border-t border-base-800' : ''}>
                  <p className="text-xs text-base-500 mb-1.5">{formatDayLabel(h.date)}</p>
                  <div className="flex flex-col gap-1">
                    {h.sets.map((s, si) => (
                      <div key={si} className="flex items-center justify-between text-sm tabular gap-2">
                        <span className="text-base-500 shrink-0">Serie {si + 1}</span>
                        <span className="font-semibold text-base-100 flex-1 text-right">{describeSet(exercise, s)}</span>
                        <span className="text-base-400 text-xs shrink-0">RIR {s.rir}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!showAllHistory && history.length > HISTORY_PREVIEW_COUNT && (
              <button onClick={() => setShowAllHistory(true)} className="text-xs text-brand font-semibold mt-3">
                Ver {history.length - HISTORY_PREVIEW_COUNT} sesiones anteriores más
              </button>
            )}
          </Card>
        )}

        <Button size="lg" className="w-full" disabled={!activeWorkout} onClick={addToWorkout}>
          {activeWorkout ? 'Añadir a entrenamiento' : 'Inicia un entrenamiento para añadirlo'}
        </Button>
      </div>
    </div>
  )
}
