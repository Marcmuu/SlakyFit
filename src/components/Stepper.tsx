import { useState } from 'react'
import NumericKeypad from './NumericKeypad'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  decimals?: number
  keypadDecimals?: number
  label?: string
}

export default function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix,
  decimals = 0,
  keypadDecimals,
  label,
}: StepperProps) {
  const [keypadOpen, setKeypadOpen] = useState(false)
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="w-12 h-12 rounded-xl bg-base-800 border border-base-700 text-2xl font-semibold text-base-100 active:bg-base-700 flex items-center justify-center shrink-0"
        aria-label="Disminuir"
      >
        –
      </button>
      <button
        type="button"
        onClick={() => setKeypadOpen(true)}
        className="min-w-[4.5rem] text-center rounded-lg active:bg-base-800 py-1"
        aria-label="Introducir valor exacto"
      >
        <span className="text-3xl font-bold tabular text-base-100">{display}</span>
        {suffix && <span className="ml-1 text-base text-base-400">{suffix}</span>}
      </button>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="w-12 h-12 rounded-xl bg-base-800 border border-base-700 text-2xl font-semibold text-base-100 active:bg-base-700 flex items-center justify-center shrink-0"
        aria-label="Aumentar"
      >
        +
      </button>

      <NumericKeypad
        open={keypadOpen}
        initialValue={value}
        decimals={keypadDecimals ?? decimals}
        suffix={suffix}
        min={min}
        max={max}
        title={label}
        onCancel={() => setKeypadOpen(false)}
        onConfirm={(v) => {
          onChange(v)
          setKeypadOpen(false)
        }}
      />
    </div>
  )
}
