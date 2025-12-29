import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Turmas } from './pages/Turmas'
import { SubjectDetails } from './pages/SubjectDetails'
import { ClassroomFeed } from './pages/ClassroomFeed'
import { Profile } from './pages/Profile'
import { Courses } from './pages/Courses'
import { Agenda } from './pages/Agenda'
import { Focus } from './pages/Focus'
import { Stats } from './pages/Stats'
import { Schedule } from './pages/Schedule'
import { LayoutDashboard, Users, UserCircle, Award, CalendarDays, Timer, Calendar } from 'lucide-react'
import { Toaster } from 'sonner'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-gray-500 text-sm">Carregando...</div>
  return user ? children : <Navigate to="/login" />
}

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) return null

  const getIconClass = (path) => {
    const isActive = location.pathname === path
    return isActive 
      ? "text-[#0047AB] dark:text-blue-400 scale-110" 
      : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-2 px-1 flex justify-between items-end z-50 pb-safe shadow-lg select-none transition-colors duration-300">
      
      <div className="flex flex-1 justify-around">
        <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/dashboard')}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Início</span>
        </Link>
        
        <Link to="/agenda" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/agenda')}`}>
            <CalendarDays className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Agenda</span>
        </Link>

        <Link to="/horario" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/horario')}`}>
            <Calendar className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Horário</span>
        </Link>
      </div>

      <div className="relative -top-6 mx-2">
        <Link to="/foco" className="flex flex-col items-center group">
            <div className="bg-[#0047AB] dark:bg-blue-600 p-3.5 rounded-full shadow-xl border-4 border-gray-50 dark:border-slate-950 text-white active:scale-95 transition-all group-hover:scale-105">
                <Timer className="h-7 w-7" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wide text-[#0047AB] dark:text-blue-400 mt-1 absolute -bottom-5">Foco</span>
        </Link>
      </div>

      <div className="flex flex-1 justify-around">
        <Link to="/turmas" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/turmas')}`}>
            <Users className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Turmas</span>
        </Link>

        <Link to="/cursos" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/cursos')}`}>
            <Award className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Cursos</span>
        </Link>

        <Link to="/perfil" className={`flex flex-col items-center gap-1 transition p-2 ${getIconClass('/perfil')}`}>
            <UserCircle className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Perfil</span>
        </Link>
      </div>

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
              <Route path="/horario" element={<PrivateRoute><Schedule /></PrivateRoute>} />
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