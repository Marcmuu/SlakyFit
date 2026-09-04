import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { prForExercise, computeE1RM } from '../../data/progression'
import { formatDayLabel, formatWeekday } from '../../lib/format'
import { describeSet, effectiveWeight, effectiveReps } from '../../lib/setFormat'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ActionSheet from '../../components/ActionSheet'

export default function DayDetail() {
  const { date } = useParams()
  const { sessions, deleteSession, activities, deleteActivity } = useAppStore()
  const navigate = useNavigate()
  const daySessions = sessions.filter((s) => s.date === date)
  const dayActivities = activities.filter((a) => a.date === date)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteActivityId, setConfirmDeleteActivityId] = useState<string | null>(null)
  useBodyScrollLock(confirmDeleteId !== null || confirmDeleteActivityId !== null)

  return (
    <div className="pb-8">
      <PageHeader title={date ? formatDayLabel(date) : 'Día'} subtitle={date ? formatWeekday(date) : undefined} onBack={() => navigate('/calendar')} />
      <div className="px-4 flex flex-col gap-4">
        {daySessions.length === 0 && dayActivities.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-base-400">Sin entreno ni actividad este día.</p>
          </Card>
        )}

        {dayActivities.map((activity) => (
          <Card key={activity.id}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: `${activity.color}22` }}
              >
                {activity.emoji}
              </span>
              <h2 className="text-lg font-extrabold flex-1 min-w-0 truncate">{activity.name}</h2>
              {activity.durationMin && <span className="text-xs text-base-500 tabular shrink-0 whitespace-nowrap">{activity.durationMin} min</span>}
            </div>
            {activity.notes && <p className="text-sm text-base-400 mt-2">"{activity.notes}"</p>}
            <div className="flex gap-4 mt-3 pt-3 border-t border-base-800 text-xs font-semibold">
              <button className="text-brand" onClick={() => navigate(`/activity/${activity.id}/edit`)}>
                Editar
              </button>
              <button className="text-accent-push" onClick={() => setConfirmDeleteActivityId(activity.id)}>
                Eliminar
              </button>
            </div>
          </Card>
        ))}

        {daySessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: session.dayColor }} />
                <h2 className="text-xl font-extrabold flex-1 min-w-0 truncate">{session.dayName}</h2>
                {session.durationMin && <span className="text-xs text-base-500 tabular shrink-0 whitespace-nowrap">{session.durationMin} min</span>}
              </div>
              {session.notes && <p className="text-sm text-base-400 mt-2">"{session.notes}"</p>}
              <div className="flex gap-4 mt-3 pt-3 border-t border-base-800 text-xs font-semibold">
                <button className="text-brand" onClick={() => navigate(`/session/${session.id}/edit`)}>
                  Editar
                </button>
                <button className="text-accent-push" onClick={() => setConfirmDeleteId(session.id)}>
                  Eliminar
                </button>
              </div>
            </Card>

            {session.exercises.map((sessionEx, i) => {
              const exercise = getExercise(sessionEx.exerciseId)!
              const original = sessionEx.originalExerciseId ? getExercise(sessionEx.originalExerciseId) : undefined
              const pr = prForExercise(sessionEx.exerciseId, sessions)
              return (
                <Card key={i}>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-bold text-base-100">{exercise.name}</p>
                    {sessionEx.isExtra && <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">EXTRA</span>}
                    {original && (
                      <span className="text-[10px] font-bold text-accent-pull bg-accent-pull/10 px-1.5 py-0.5 rounded-full">
                        SUSTITUYE A {original.name.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col divide-y divide-base-800">
                    {sessionEx.sets.map((s, si) => {
                      const isRecord =
                        pr &&
                        computeE1RM(effectiveWeight(exercise, s), effectiveReps(s)) > 0 &&
                        computeE1RM(effectiveWeight(exercise, s), effectiveReps(s)) === computeE1RM(effectiveWeight(exercise, pr), effectiveReps(pr))
                      return (
                        <div key={si} className="py-1.5 flex items-center justify-between text-sm tabular gap-2">
                          <span className="text-base-500 shrink-0">Serie {si + 1}</span>
                          <span className="font-semibold text-base-100 flex-1 text-right">{describeSet(exercise, s)}</span>
                          <span className="text-base-400 shrink-0">RIR {s.rir ?? '—'}</span>
                          {isRecord && <span className="text-[10px] font-bold text-brand shrink-0">PR</span>}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        ))}

        {date && (
          <div className="flex flex-col gap-2.5">
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate(`/calendar/${date}/session/new`)}>
              + Añadir entreno a este día
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate(`/calendar/${date}/activity/new`)}>
              + Añadir actividad deportiva
            </Button>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <ActionSheet onDismiss={() => setConfirmDeleteId(null)}>
          <p className="text-lg font-bold mb-1">¿Eliminar este entreno?</p>
          <p className="text-sm text-base-400 mb-5">Se borrarán todos los ejercicios y series registrados este día. No se puede deshacer.</p>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                deleteSession(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
            >
              Eliminar entreno
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
          </div>
        </ActionSheet>
      )}

      {confirmDeleteActivityId && (
        <ActionSheet onDismiss={() => setConfirmDeleteActivityId(null)}>
          <p className="text-lg font-bold mb-1">¿Eliminar esta actividad?</p>
          <p className="text-sm text-base-400 mb-5">No se puede deshacer.</p>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                deleteActivity(confirmDeleteActivityId)
                setConfirmDeleteActivityId(null)
              }}
            >
              Eliminar actividad
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setConfirmDeleteActivityId(null)}>
              Cancelar
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
