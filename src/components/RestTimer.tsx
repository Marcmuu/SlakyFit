import { useEffect, useState } from 'react'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import Button from './Button'

const PRESETS = [30, 60, 120, 180]
const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatPreset(sec: number): string {
  return sec < 60 ? `${sec}s` : `${sec / 60}min`
}

function formatClock(sec: number): string {
  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// `trigger` sube cada vez que se guarda una serie; ese cambio es la señal
// para (re)ofrecer el descanso, sin acoplar este componente al resto del formulario.
export default function RestTimer({ trigger }: { trigger: number }) {
  const [duration, setDuration] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [showPicker, setShowPicker] = useState(false)

  const open = showPicker || duration !== null
  useBodyScrollLock(open)

  useEffect(() => {
    if (trigger === 0) return
    setShowPicker(true)
    setDuration(null)
    setRemaining(0)
  }, [trigger])

  useEffect(() => {
    if (duration === null || remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [duration, remaining])

  useEffect(() => {
    if (duration !== null && remaining === 0) {
      navigator.vibrate?.(200)
    }
  }, [remaining, duration])

  if (!open) return null

  function start(seconds: number) {
    setDuration(seconds)
    setRemaining(seconds)
    setShowPicker(false)
  }

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta))
  }

  function close() {
    setDuration(null)
    setShowPicker(false)
  }

  const finished = duration !== null && remaining === 0
  const progress = duration ? remaining / duration : 0
  const dashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 bg-base-950 flex flex-col safe-bottom">
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
        <p className="text-lg font-bold text-base-100">{showPicker ? '¿Descanso antes de la próxima serie?' : finished ? 'Descanso terminado' : 'Descanso'}</p>
        <button
          onClick={close}
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-base-800 text-base-300 active:bg-base-700"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {showPicker ? (
          <div className="w-full max-w-xs grid grid-cols-2 gap-3">
            {PRESETS.map((sec) => (
              <button
                key={sec}
                onClick={() => start(sec)}
                className="h-16 rounded-2xl bg-base-800 border border-base-700 text-lg font-bold text-base-100 active:bg-base-700"
              >
                {formatPreset(sec)}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#1c2127" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke="#c4ff3d"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-extrabold tabular text-base-100">{formatClock(remaining)}</span>
              </div>
            </div>

            {finished ? (
              <Button size="lg" className="w-full max-w-xs" onClick={close}>
                Cerrar
              </Button>
            ) : (
              <div className="flex gap-3 w-full max-w-xs">
                <button onClick={() => adjust(-15)} className="flex-1 h-12 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700">
                  -15s
                </button>
                <button onClick={close} className="flex-1 h-12 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700">
                  Saltar
                </button>
                <button onClick={() => adjust(15)} className="flex-1 h-12 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700">
                  +15s
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
