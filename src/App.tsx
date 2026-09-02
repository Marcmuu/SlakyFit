import { lazy, Suspense, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './screens/Dashboard'
import SelectWorkout from './screens/train/SelectWorkout'
import ActiveWorkout from './screens/train/ActiveWorkout'
import ExerciseLogger from './screens/train/ExerciseLogger'
import SwapExercise from './screens/train/SwapExercise'
import AddExercise from './screens/train/AddExercise'
import Calendar from './screens/calendar/Calendar'
import DayDetail from './screens/calendar/DayDetail'
import Library from './screens/library/Library'
import More from './screens/more/More'
import RoutineListScreen from './screens/more/RoutineListScreen'
import RoutineListDetail from './screens/more/RoutineListDetail'
import Programs from './screens/more/Programs'
import ProfileScreen from './screens/more/ProfileScreen'
import SettingsScreen from './screens/more/SettingsScreen'

// Cargadas bajo demanda: son las únicas pantallas que tiran de recharts,
// así el chunk inicial no paga ese peso si el usuario no visita Progreso/Ejercicio.
const Progress = lazy(() => import('./screens/progress/Progress'))
const ExerciseDetail = lazy(() => import('./screens/library/ExerciseDetail'))

const RoutinesScreen = lazy(() => import('./screens/routines/RoutinesScreen'))
const RoutineEditor = lazy(() => import('./screens/routines/RoutineEditor'))
const DayEditor = lazy(() => import('./screens/routines/DayEditor'))
const SessionEditor = lazy(() => import('./screens/calendar/SessionEditor'))

const FULLSCREEN_PREFIXES = ['/train/session']
const MINIMIZE_THRESHOLD_PX = 70

function FullscreenDragHandle() {
  const navigate = useNavigate()
  const startY = useRef<number | null>(null)

  return (
    <div
      className="pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-1.5 flex justify-center shrink-0"
      style={{ touchAction: 'none' }}
      onTouchStart={(e) => {
        startY.current = e.touches[0].clientY
      }}
      onTouchMove={(e) => {
        if (startY.current === null) return
        const delta = e.touches[0].clientY - startY.current
        if (delta > MINIMIZE_THRESHOLD_PX) {
          startY.current = null
          navigate('/')
        }
      }}
      onTouchEnd={() => {
        startY.current = null
      }}
      aria-label="Deslizar hacia abajo para minimizar"
    >
      <span className="w-10 h-1.5 rounded-full bg-base-700" aria-hidden />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-base-950 text-base-100">
      <div className={`max-w-md mx-auto min-h-screen relative ${isFullscreen ? '' : 'pb-24'}`}>
        {isFullscreen && <FullscreenDragHandle />}
        <Suspense fallback={<div className="p-4 text-base-400 text-sm">Cargando…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/train" element={<SelectWorkout />} />
            <Route path="/train/session" element={<ActiveWorkout />} />
            <Route path="/train/session/exercise/:index" element={<ExerciseLogger />} />
            <Route path="/train/session/swap/:index" element={<SwapExercise />} />
            <Route path="/train/session/add" element={<AddExercise />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/calendar/:date" element={<DayDetail />} />
            <Route path="/calendar/:date/session/new" element={<SessionEditor />} />
            <Route path="/session/:sessionId/edit" element={<SessionEditor />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:exerciseId" element={<ExerciseDetail />} />
            <Route path="/routines" element={<RoutinesScreen />} />
            <Route path="/routines/:routineId" element={<RoutineEditor />} />
            <Route path="/routines/:routineId/day/:dayId" element={<DayEditor />} />
            <Route path="/more" element={<More />} />
            <Route path="/more/section/:section" element={<RoutineListScreen />} />
            <Route path="/more/routine/:id" element={<RoutineListDetail />} />
            <Route path="/more/programs" element={<Programs />} />
            <Route path="/more/profile" element={<ProfileScreen />} />
            <Route path="/more/settings" element={<SettingsScreen />} />
          </Routes>
        </Suspense>
        {!isFullscreen && <BottomNav />}
      </div>
    </div>
  )
}
