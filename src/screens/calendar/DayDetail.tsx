import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { prForExercise, computeE1RM } from '../../data/progression'
import { formatDayLabel, formatWeekday, formatWeight } from '../../lib/format'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function DayDetail() {
  const { date } = useParams()
  const { sessions, deleteSession } = useAppStore()
  const navigate = useNavigate()
  const daySessions = sessions.filter((s) => s.date === date)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  useBodyScrollLock(confirmDeleteId !== null)

  return (
    <div className="pb-8">
      <PageHeader title={date ? formatDayLabel(date) : 'Día'} subtitle={date ? formatWeekday(date) : undefined} onBack />
      <div className="px-4 flex flex-col gap-4">
        {daySessions.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-base-400">Sin entrenamiento registrado este día.</p>
          </Card>
        )}

        {daySessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: session.dayColor }} />
                <h2 className="text-xl font-extrabold flex-1">{session.dayName}</h2>
                {session.durationMin && <span className="text-xs text-base-500 tabular">{session.durationMin} min</span>}
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
                      const isRecord = pr && pr.weight === s.weight && pr.reps === s.reps && computeE1RM(s.weight, s.reps) === computeE1RM(pr.weight, pr.reps)
                      return (
                        <div key={si} className="py-1.5 flex items-center justify-between text-sm tabular">
                          <span className="text-base-500">Serie {si + 1}</span>
                          <span className="font-semibold text-base-100">
                            {formatWeight(s.weight)} kg × {s.reps}
                          </span>
                          <span className="text-base-400">RIR {s.rir}</span>
                          {isRecord && <span className="text-[10px] font-bold text-brand">PR</span>}
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
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate(`/calendar/${date}/session/new`)}>
            + Añadir entrenamiento a este día
          </Button>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-md bg-base-900 rounded-t-3xl p-5 safe-bottom">
            <p className="text-lg font-bold mb-1">¿Eliminar este entrenamiento?</p>
            <p className="text-sm text-base-400 mb-4">Se borrarán todos los ejercicios y series registrados este día. No se puede deshacer.</p>
            <div className="flex flex-col gap-2.5">
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  deleteSession(confirmDeleteId)
                  setConfirmDeleteId(null)
                }}
              >
                Eliminar entrenamiento
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
