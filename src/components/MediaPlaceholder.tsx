export default function MediaPlaceholder({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-br from-base-800 to-base-900 border border-base-800 overflow-hidden ${compact ? 'h-28' : ''}`}
      style={compact ? undefined : { paddingBottom: '75%' }}
    >
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #c4ff3d 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-base-400">
        <div className="w-11 h-11 rounded-full bg-base-800 border border-base-700 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="6,4 20,12 6,20" fill="currentColor" stroke="none" />
          </svg>
        </div>
        {!compact && <span className="text-xs text-base-500 px-4 text-center line-clamp-1">{label}</span>}
      </div>
    </div>
  )
}
