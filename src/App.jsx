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
import { Schedule } from './pages/Schedule.jsx'
import { LayoutDashboard, Users, User, GraduationCap, CalendarCheck, Clock, BarChart2 } from 'lucide-react'
import { Toaster } from 'sonner'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">Carregando...</div>
  return user ? children : <Navigate to="/login" />
}

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) return null

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to
    return (
      <Link to={to} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
        <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex justify-around items-center z-50 px-2 pb-safe">
      <NavItem to="/dashboard" icon={LayoutDashboard} label="Início" />
      <NavItem to="/agenda" icon={CalendarCheck} label="Agenda" />
      <NavItem to="/horario" icon={Clock} label="Horário" />
      <NavItem to="/foco" icon={GraduationCap} label="Foco" />
      <NavItem to="/turmas" icon={Users} label="Turmas" />
      <NavItem to="/perfil" icon={User} label="Perfil" />
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-center" theme="system" className="font-sans" />
          
          <div className="min-h-screen bg-muted/30 pb-20 transition-colors duration-300">
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
              <Route path="/horario" element={<PrivateRoute><Schedule /></PrivateRoute>} />
            </Routes>

            <Navigation />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App