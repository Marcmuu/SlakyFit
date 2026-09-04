import { useState } from 'react'
import MediaPlaceholder from './MediaPlaceholder'
import type { Exercise } from '../types'

export default function ExerciseMedia({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const [frame, setFrame] = useState(0)
  const [broken, setBroken] = useState(false)
  const images = exercise.externalImages
  const hasImages = !!images && images.length > 0 && !broken

  return (
    <div className="relative w-full">
      {hasImages ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFrame((f) => (f + 1) % images!.length)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setFrame((f) => (f + 1) % images!.length)
            }
          }}
          className={`relative w-full rounded-2xl overflow-hidden bg-base-950 border border-base-800 cursor-pointer ${compact ? 'h-28' : ''}`}
          style={compact ? undefined : { paddingBottom: '75%' }}
        >
          <img
            src={images![frame]}
            alt={exercise.name}
            className={compact ? 'w-full h-full object-cover' : 'absolute inset-0 w-full h-full object-contain'}
            loading="lazy"
            onError={() => setBroken(true)}
          />
          {images!.length > 1 && (
            <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-1 rounded-full">
              {frame + 1}/{images!.length} · toca para cambiar
            </span>
          )}
        </div>
      ) : (
        <MediaPlaceholder label={exercise.name} compact={compact} />
      )}

      {!compact && (
        <a
          href={youtubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="Ver técnica en YouTube"
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center active:bg-black/80"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.5v-7L15.5 12Z" />
          </svg>
        </a>
      )}
    </div>
  )
}

export function youtubeSearchUrl(exerciseName: string): string {
  const query = `${exerciseName} técnica ejercicio`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
