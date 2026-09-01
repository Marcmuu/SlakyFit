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
import Progress from './screens/progress/Progress'
import Library from './screens/library/Library'
import ExerciseDetail from './screens/library/ExerciseDetail'
import More from './screens/more/More'
import RoutineListScreen from './screens/more/RoutineListScreen'
import RoutineListDetail from './screens/more/RoutineListDetail'
import Programs from './screens/more/Programs'
import ProfileScreen from './screens/more/ProfileScreen'
import SettingsScreen from './screens/more/SettingsScreen'

const FULLSCREEN_PREFIXES = ['/train/session']

export default function App() {
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-base-950 text-base-100">
      <div className={`max-w-md mx-auto min-h-screen relative ${isFullscreen ? '' : 'pb-24'}`}>
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
        {!isFullscreen && <BottomNav />}
      </div>
    </div>
  )
}
