import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../data/store'
import { getLastWorkoutSession, getRecommendedDay, countSessionsThisWeek } from '../data/recommendation'
import { mostRecentPR } from '../data/analytics'
import { currentPhase, currentWeekNumber } from '../lib/programWeek'
import { formatDayLabel, formatWeight } from '../lib/format'
import { buildActiveWorkout } from '../lib/startWorkout'
import Card from '../components/Card'
import Button from '../components/Button'
import WeekStrip from '../components/WeekStrip'

export default function Dashboard() {
  const { sessions, program, setActiveWorkout, activeWorkout, routines, activeRoutineId } = useAppStore()
  const navigate = useNavigate()

  const activeRoutine = routines.find((r) => r.id === activeRoutineId)
  const recommendedDay = useMemo(() => getRecommendedDay(activeRoutine, sessions), [activeRoutine, sessions])
  const lastSession = getLastWorkoutSession(sessions)
  const week = program ? currentWeekNumber(program) : 1
  const phase = program ? currentPhase(program) : undefined
  const sessionsThisWeek = countSessionsThisWeek(sessions)
  const recentPR = useMemo(() => mostRecentPR(sessions), [sessions])

  function startRecommended() {
    if (activeWorkout) {
      navigate('/train/session')
      return
    }
    if (!activeRoutine || !recommendedDay) {
      navigate('/routines')
      return
    }
    setActiveWorkout(buildActiveWorkout(activeRoutine, recommendedDay))
    navigate('/train/session')
  }

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-base-400">Hoy</p>
          <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
            Semana {week} de {program?.durationWeeks ?? 6}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">SlakyFit</h1>
      </div>

      {activeWorkout && (
        <Card className="border-brand/40 bg-brand/5">
          <p className="text-sm text-brand font-semibold mb-1">Entrenamiento en curso</p>
          <p className="text-base-300 text-sm mb-3">Tienes {activeWorkout.dayName} sin terminar.</p>
          <Button className="w-full" onClick={() => navigate('/train/session')}>Continuar entrenamiento</Button>
        </Card>
      )}

      <Card>
        <p className="text-sm text-base-400 mb-1">Te recomendamos</p>
        <div className="flex items-center gap-2 mb-4">
          {recommendedDay && <span className="w-2.5 h-2.5 rounded-full" style={{ background: recommendedDay.color }} />}
          <h2 className="text-2xl font-bold">{recommendedDay?.name ?? 'Crea tu primera rutina'}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-base-500">Último entrenamiento</p>
            <p className="font-semibold text-base-100">{lastSession ? lastSession.dayName : 'Sin registros todavía'}</p>
            {lastSession && <p className="text-xs text-base-500">{formatDayLabel(lastSession.date)}</p>}
          </div>
          <div>
            <p className="text-base-500">Fase actual</p>
            <p className="font-semibold text-base-100">{phase?.name ?? '—'}</p>
            <p className="text-xs text-base-500">{sessionsThisWeek} entrenos esta semana</p>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={startRecommended}>
          {activeWorkout ? 'Continuar entrenamiento' : recommendedDay ? 'Empezar entrenamiento' : 'Crear rutina'}
        </Button>
        <button className="w-full text-center text-sm text-base-400 mt-3 py-1" onClick={() => navigate('/train')}>
          Cambiar entrenamiento
        </button>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">Esta semana</p>
          <span className="text-xs text-base-500">{sessionsThisWeek} entrenamientos</span>
        </div>
        <WeekStrip sessions={sessions} />
      </Card>

      {recentPR ? (
        <Card className="bg-brand/5 border-brand/30">
          <p className="text-xs text-brand font-semibold mb-1">Récord reciente</p>
          <p className="text-base-100 font-bold">
            {recentPR.exerciseName} · {formatWeight(recentPR.weight)} kg × {recentPR.reps}
          </p>
          <p className="text-xs text-base-500 mt-0.5">{formatDayLabel(recentPR.date)}</p>
        </Card>
      ) : (
        <Card>
          <p className="text-sm font-bold mb-1">Todavía sin récords</p>
          <p className="text-sm text-base-500">Registra tus primeras series y aquí aparecerán tus mejores marcas.</p>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => navigate('/calendar')} className="text-center">
          <Card className="p-3 active:bg-base-800">
            <p className="text-xs font-semibold text-base-200">Calendario</p>
          </Card>
        </button>
        <button onClick={() => navigate('/progress')} className="text-center">
          <Card className="p-3 active:bg-base-800">
            <p className="text-xs font-semibold text-base-200">Progreso</p>
          </Card>
        </button>
        <button onClick={() => navigate('/library')} className="text-center">
          <Card className="p-3 active:bg-base-800">
            <p className="text-xs font-semibold text-base-200">Ejercicios</p>
          </Card>
        </button>
      </div>
    </div>
  )
}
