import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { getExerciseHistory, bestSet, bestE1RMForExercise, prForExercise, computeE1RM } from '../../data/progression'
import { formatDayLabel, formatWeight } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import ExerciseMedia, { youtubeSearchUrl } from '../../components/ExerciseMedia'
import Card from '../../components/Card'
import Button from '../../components/Button'
import TrendLineChart from '../../components/charts/TrendLineChart'

export default function ExerciseDetail() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const { sessions, activeWorkout, setActiveWorkout } = useAppStore()
  const exercise = exerciseId ? getExercise(exerciseId) : undefined

  const history = useMemo(() => (exerciseId ? getExerciseHistory(exerciseId, sessions) : []), [exerciseId, sessions])
  const pr = exerciseId ? prForExercise(exerciseId, sessions) : undefined
  const best = history[0] ? bestSet(history[0].sets) : undefined
  const e1rm = exerciseId ? bestE1RMForExercise(exerciseId, sessions) : 0

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((h) => ({
          x: formatDayLabel(h.date).split(' ')[0],
          y: Math.max(...h.sets.map((s) => computeE1RM(s.weight, s.reps))),
        })),
    [history],
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
    setActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        { exerciseId: exercise!.id, order: activeWorkout.exercises.length + 1, isExtra: true, targetSets: 3, repMin: 8, repMax: 12, sets: [] },
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

        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <p className="text-[10px] text-base-500 uppercase mb-1">Peso actual</p>
            <p className="font-bold tabular">{best ? `${formatWeight(best.weight)} kg` : '—'}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[10px] text-base-500 uppercase mb-1">PR</p>
            <p className="font-bold tabular">{pr ? `${formatWeight(pr.weight)}×${pr.reps}` : '—'}</p>
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
            <p className="text-sm font-bold mb-3">Últimos entrenamientos</p>
            <div className="flex flex-col divide-y divide-base-800">
              {history.slice(0, 6).map((h, i) => (
                <div key={i} className="py-2 flex items-start justify-between gap-2 text-sm">
                  <span className="text-base-500 shrink-0">{formatDayLabel(h.date)}</span>
                  <span className="font-semibold text-base-100 tabular text-right">
                    {formatWeight(h.sets[0].weight)} kg · {h.sets.map((s) => s.reps).join('/')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button size="lg" className="w-full" disabled={!activeWorkout} onClick={addToWorkout}>
          {activeWorkout ? 'Añadir a entrenamiento' : 'Inicia un entrenamiento para añadirlo'}
        </Button>
      </div>
    </div>
  )
}
