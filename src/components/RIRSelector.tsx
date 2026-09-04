import type { RirRange } from '../types'

const options: { value: RirRange; label: string }[] = [
  { value: '0-1', label: '0-1' },
  { value: '1-2', label: '1-2' },
  { value: '2-3', label: '2-3' },
  { value: '3+', label: '3+' },
]

export default function RIRSelector({ value, onChange }: { value: RirRange | undefined; onChange: (v: RirRange) => void }) {
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
