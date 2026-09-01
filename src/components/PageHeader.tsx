import { useNavigate } from 'react-router-dom'
import React from 'react'

export default function PageHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: boolean | (() => void)
  right?: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
      {onBack && (
        <button
          onClick={() => (typeof onBack === 'function' ? onBack() : navigate(-1))}
          className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full bg-base-800 text-base-200 active:bg-base-700 shrink-0"
          aria-label="Volver"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-sm text-base-400 truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
