import type { RirValue } from '../types'

const options: { value: RirValue; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
]

export default function RIRSelector({ value, onChange }: { value: RirValue; onChange: (v: RirValue) => void }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-colors ${
            value === opt.value ? 'bg-brand text-base-950' : 'bg-base-800 text-base-300 border border-base-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
