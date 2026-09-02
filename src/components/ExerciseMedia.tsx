import { useState } from 'react'
import MediaPlaceholder from './MediaPlaceholder'
import type { Exercise } from '../types'

export default function ExerciseMedia({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const [frame, setFrame] = useState(0)
  const [broken, setBroken] = useState(false)
  const images = exercise.externalImages

  if (!images || images.length === 0 || broken) {
    return <MediaPlaceholder label={exercise.name} compact={compact} />
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        setFrame((f) => (f + 1) % images.length)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFrame((f) => (f + 1) % images.length)
        }
      }}
      className={`relative w-full rounded-2xl overflow-hidden bg-base-950 border border-base-800 cursor-pointer ${compact ? 'h-28' : ''}`}
      style={compact ? undefined : { paddingBottom: '75%' }}
    >
      <img
        src={images[frame]}
        alt={exercise.name}
        className={compact ? 'w-full h-full object-cover' : 'absolute inset-0 w-full h-full object-contain'}
        loading="lazy"
        onError={() => setBroken(true)}
      />
      {images.length > 1 && (
        <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-1 rounded-full">
          {frame + 1}/{images.length} · toca para cambiar
        </span>
      )}
    </div>
  )
}

export function youtubeSearchUrl(exerciseName: string): string {
  const query = `${exerciseName} técnica ejercicio`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
