import React from 'react'

export default function ActionSheet({ onDismiss, children }: { onDismiss?: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="absolute inset-0" onClick={onDismiss} />
      <div className="relative w-full max-w-md bg-base-900 rounded-3xl p-5">{children}</div>
    </div>
  )
}
