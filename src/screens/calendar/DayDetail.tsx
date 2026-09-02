import { useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { prForExercise, computeE1RM } from '../../data/progression'
import { formatDayLabel, formatWeekday, formatWeight } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

export default function DayDetail() {
  const { date } = useParams()
  const { sessions } = useAppStore()
  const daySessions = sessions.filter((s) => s.date === date)

  return (
    <div>
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
      </div>
    </div>
  )
}
