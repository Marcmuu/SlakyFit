import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
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

const FULLSCREEN_PREFIXES = ['/train/session']

export default function App() {
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-base-950 text-base-100">
      <div className={`max-w-md mx-auto min-h-screen relative ${isFullscreen ? '' : 'pb-24'}`}>
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
            <Route path="/progress" element={<Progress />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:exerciseId" element={<ExerciseDetail />} />
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
