export interface SportOption {
  id: string
  name: string
  emoji: string
  color: string
}

export const SPORTS_CATALOG: SportOption[] = [
  { id: 'padel', name: 'Pádel', emoji: '🏓', color: '#3987e5' },
  { id: 'futbol', name: 'Fútbol', emoji: '⚽', color: '#199e70' },
  { id: 'tenis', name: 'Tenis', emoji: '🎾', color: '#c98500' },
  { id: 'natacion', name: 'Natación', emoji: '🏊', color: '#4fb0ff' },
  { id: 'running', name: 'Running', emoji: '🏃', color: '#d95926' },
  { id: 'ciclismo', name: 'Ciclismo', emoji: '🚴', color: '#9085e9' },
  { id: 'baloncesto', name: 'Baloncesto', emoji: '🏀', color: '#e66767' },
]

export const CUSTOM_ACTIVITY_EMOJIS = ['🏅', '🥇', '🏆', '🤸', '🧘', '🥊', '🏹', '🏸', '🥋', '⛳', '🏂', '🏄', '🚵', '🧗']
