import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Turmas } from './pages/Turmas'
import { SubjectDetails } from './pages/SubjectDetails'
import { ClassroomFeed } from './pages/ClassroomFeed'
import { Profile } from './pages/Profile'
import { Courses } from './pages/Courses'
import { LayoutDashboard, Users, UserCircle, Award } from 'lucide-react'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) return null

  const isActive = (path) => location.pathname === path ? "text-[#0047AB]" : "text-gray-400 hover:text-gray-600"

  // Adicionei 'select-none' para evitar seleção acidental de texto
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-2 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] select-none">
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition p-2 ${isActive('/dashboard')}`}>
        <LayoutDashboard className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wide">Início</span>
      </Link>
      
      <Link to="/turmas" className={`flex flex-col items-center gap-1 transition p-2 ${isActive('/turmas')}`}>
        <Users className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wide">Turmas</span>
      </Link>

      <Link to="/cursos" className={`flex flex-col items-center gap-1 transition p-2 ${isActive('/cursos')}`}>
        <Award className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wide">Cursos</span>
      </Link>

      <Link to="/perfil" className={`flex flex-col items-center gap-1 transition p-2 ${isActive('/perfil')}`}>
        <UserCircle className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wide">Perfil</span>
      </Link>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/turmas" element={<PrivateRoute><Turmas /></PrivateRoute>} />
            <Route path="/turma/:id" element={<PrivateRoute><ClassroomFeed /></PrivateRoute>} />
            <Route path="/materia/:id" element={<PrivateRoute><SubjectDetails /></PrivateRoute>} />
            <Route path="/cursos" element={<PrivateRoute><Courses /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>

          <Navigation />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App