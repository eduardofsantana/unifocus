import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Turmas } from './pages/Turmas' // <--- Garanta que importou isso
import { SubjectDetails } from './pages/SubjectDetails'
import { LayoutDashboard, Users, GraduationCap } from 'lucide-react'
import { ClassroomFeed } from './pages/ClassroomFeed'

// Componente que protege rotas privadas
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Menu de Navegação (Só aparece se estiver logado)
function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) return null // Não mostra menu no login

  // Função para saber se o botão está ativo
  const isActive = (path) => location.pathname === path ? "text-blue-600" : "text-gray-400 hover:text-gray-600"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center z-50 pb-safe">
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard')}`}>
        <LayoutDashboard className="h-6 w-6" />
        <span className="text-xs font-medium">Início</span>
      </Link>
      
      <Link to="/turmas" className={`flex flex-col items-center gap-1 ${isActive('/turmas')}`}>
        <Users className="h-6 w-6" />
        <span className="text-xs font-medium">Turmas</span>
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
            <Route path="/materia/:id" element={<PrivateRoute><SubjectDetails /></PrivateRoute>} />
            <Route path="/turma/:id" element={<PrivateRoute><ClassroomFeed /></PrivateRoute>} />
          </Routes>

          {/* O Menu fica fora das rotas para aparecer sempre */}
          <Navigation />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App