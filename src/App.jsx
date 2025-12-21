import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { Login } from './pages/Login.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Turmas } from './pages/Turmas.jsx'
import { SubjectDetails } from './pages/SubjectDetails.jsx'
import { ClassroomFeed } from './pages/ClassroomFeed.jsx'
import { Profile } from './pages/Profile.jsx'
import { Courses } from './pages/Courses.jsx'
import { Agenda } from './pages/Agenda.jsx'
import { Focus } from './pages/Focus.jsx'
import { Stats } from './pages/Stats.jsx'
import { LayoutDashboard, Users, UserCircle, Award, CalendarDays, Timer } from 'lucide-react'
import { Toaster } from 'sonner'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) return null

  const getIconClass = (path) => {
    const isActive = location.pathname === path
    return isActive 
      ? "text-[#0047AB] dark:text-blue-400" 
      : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-2 px-1 flex justify-around items-end z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] select-none transition-colors duration-300">
      
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/dashboard')}`}>
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[9px] font-medium uppercase tracking-wide">Início</span>
      </Link>
      
      <Link to="/agenda" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/agenda')}`}>
        <CalendarDays className="h-5 w-5" />
        <span className="text-[9px] font-medium uppercase tracking-wide">Agenda</span>
      </Link>

      <Link to="/foco" className="flex flex-col items-center mb-4">
        <div className="bg-[#0047AB] dark:bg-blue-600 p-3 rounded-full shadow-lg border-4 border-gray-50 dark:border-slate-950 text-white active:scale-95 transition-all">
            <Timer className="h-6 w-6" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#0047AB] dark:text-blue-400 mt-1 absolute bottom-2">Foco</span>
      </Link>

      <Link to="/turmas" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/turmas')}`}>
        <Users className="h-5 w-5" />
        <span className="text-[9px] font-medium uppercase tracking-wide">Turmas</span>
      </Link>

      <Link to="/cursos" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/cursos')}`}>
        <Award className="h-5 w-5" />
        <span className="text-[9px] font-medium uppercase tracking-wide">Cursos</span>
      </Link>

      <Link to="/perfil" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/perfil')}`}>
        <UserCircle className="h-5 w-5" />
        <span className="text-[9px] font-medium uppercase tracking-wide">Perfil</span>
      </Link>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors closeButton theme="system" />
          
          <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/turmas" element={<PrivateRoute><Turmas /></PrivateRoute>} />
              <Route path="/turma/:id" element={<PrivateRoute><ClassroomFeed /></PrivateRoute>} />
              <Route path="/materia/:id" element={<PrivateRoute><SubjectDetails /></PrivateRoute>} />
              <Route path="/cursos" element={<PrivateRoute><Courses /></PrivateRoute>} />
              <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
              <Route path="/foco" element={<PrivateRoute><Focus /></PrivateRoute>} />
              <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
            </Routes>

            <Navigation />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App