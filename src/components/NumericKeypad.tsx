import { useEffect, useState } from 'react'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'

interface NumericKeypadProps {
  open: boolean
  initialValue: number
  decimals?: number
  suffix?: string
  min?: number
  max?: number
  title?: string
  onCancel: () => void
  onConfirm: (value: number) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export default function NumericKeypad({
  open,
  initialValue,
  decimals = 0,
  suffix,
  min,
  max,
  title,
  onCancel,
  onConfirm,
}: NumericKeypadProps) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (open) setText('')
  }, [open, initialValue])

  useBodyScrollLock(open)

  if (!open) return null

  const preview = text === '' ? formatValue(initialValue, decimals) : text
  const isPlaceholder = text === ''

  function press(key: string) {
    if (key === '⌫') {
      setText((t) => t.slice(0, -1))
      return
    }
    if (key === '.') {
      if (decimals <= 0) return
      setText((t) => (t.includes('.') ? t : t === '' ? '0.' : t + '.'))
      return
    }
    setText((t) => {
      if (t.length >= 7) return t
      if (t === '0') return key
      return t + key
    })
  }

  function confirm() {
    const raw = text === '' ? initialValue : parseFloat(text)
    let value = Number.isFinite(raw) ? raw : initialValue
    if (min !== undefined) value = Math.max(min, value)
    if (max !== undefined) value = Math.min(max, value)
    onConfirm(Math.round(value * 10 ** decimals) / 10 ** decimals)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-base-900 rounded-t-3xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <p className="text-sm text-base-400 mb-1 text-center">{title}</p>}
        <div className="flex items-baseline justify-center gap-1 py-4 mb-2">
          <span className={`text-4xl font-bold tabular ${isPlaceholder ? 'text-base-500' : 'text-base-100'}`}>{preview}</span>
          {suffix && <span className="text-lg text-base-400">{suffix}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              disabled={key === '.' && decimals <= 0}
              className="h-14 rounded-2xl bg-base-800 border border-base-700 text-xl font-semibold text-base-100 active:bg-base-700 disabled:opacity-30 flex items-center justify-center"
            >
              {key}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl bg-base-800 border border-base-700 text-base-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 h-12 rounded-2xl bg-brand text-base-950 font-bold"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}

function formatValue(value: number, decimals: number): string {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
}
