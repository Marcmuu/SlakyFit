import { useState } from 'react'
import { useAppStore } from '../data/store'
import { bestSet, prForExercise, bestE1RMForExercise, getExerciseHistory } from '../data/progression'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import { formatDayLabel, formatWeight } from '../lib/format'
import { describeSet } from '../lib/setFormat'
import ExerciseMedia, { youtubeSearchUrl } from './ExerciseMedia'
import GymPhotoCard from './GymPhotoCard'
import Card from './Card'
import type { Exercise } from '../types'

const HISTORY_PREVIEW_COUNT = 4

export default function ExerciseInfoModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const { sessions } = useAppStore()
  const [showAllHistory, setShowAllHistory] = useState(false)
  useBodyScrollLock(true)

  const history = getExerciseHistory(exercise.id, sessions)
  const isTime = exercise.logType === 'time'
  const pr = isTime ? undefined : prForExercise(exercise.id, sessions)
  const best = !isTime && history[0] ? bestSet(history[0].sets, exercise) : undefined
  const e1rm = isTime ? 0 : bestE1RMForExercise(exercise.id, sessions)
  const bestDurationSec = isTime ? Math.max(0, ...history.flatMap((h) => h.sets.map((s) => s.durationSec ?? 0))) : 0
  const lastDurationSec = isTime ? history[0]?.sets[history[0].sets.length - 1]?.durationSec : undefined
  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW_COUNT)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto sm:mx-4 h-[88vh] supports-[height:100svh]:h-[88svh] max-h-[720px] bg-base-950 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl self-end sm:self-center">
        <div className="shrink-0 flex flex-col items-center pt-2.5 pb-1 border-b border-base-800">
          <span className="w-9 h-1 rounded-full bg-base-700 mb-2" />
          <div className="w-full flex items-center justify-between px-4 pb-2">
            <h2 className="text-lg font-bold truncate pr-3">{exercise.name}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-base-800 text-base-300 active:bg-base-700"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-4 safe-bottom">
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

          <GymPhotoCard exerciseId={exercise.id} />

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
                <p className="font-bold tabular">{lastDurationSec ? `${lastDurationSec}s` : '—'}</p>
              </Card>
            </div>
          ) : (
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
          )}

          {history.length > 0 && (
            <Card>
              <p className="text-sm font-bold mb-3">Historial</p>
              <div className="flex flex-col gap-3">
                {visibleHistory.map((h, i) => (
                  <div key={h.date} className={i > 0 ? 'pt-3 border-t border-base-800' : ''}>
                    <p className="text-xs text-base-500 mb-1.5">{formatDayLabel(h.date)}</p>
                    <div className="flex flex-col gap-1">
                      {h.sets.map((s, si) => (
                        <div key={si} className="flex items-center justify-between text-sm tabular gap-2">
                          <span className="text-base-500 shrink-0">Serie {si + 1}</span>
                          <span className="font-semibold text-base-100 flex-1 text-right">{describeSet(exercise, s)}</span>
                          <span className="text-base-400 text-xs shrink-0">RIR {s.rir ?? '—'}</span>
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
        </div>
      </div>
    </div>
  )
}
