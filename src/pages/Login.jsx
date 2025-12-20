import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, ArrowRight, Loader2, GraduationCap, CheckCircle } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // Alternar entre Login/Cadastro
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Redireciona se já estiver logado
  if (user) {
    navigate('/dashboard')
    return null
  }

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
        // --- CADASTRO ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        alert('Cadastro realizado! Verifique seu e-mail ou faça login.')
        setIsSignUp(false) // Volta para tela de login
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LADO ESQUERDO - BANNER (Só aparece em telas grandes lg:flex) */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        {/* Círculos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>
        
        <div className="relative z-10 text-white max-w-md p-12">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-8 shadow-inner border border-white/20">
                <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Gerencie sua vida acadêmica em um só lugar.</h2>
            <div className="space-y-4 text-blue-100 text-lg">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-300" />
                    <span>Controle de faltas inteligente</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-300" />
                    <span>Calculadora de notas automática</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-300" />
                    <span>Feed de turmas colaborativo</span>
                </div>
            </div>
        </div>
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          
          {/* Cabeçalho Mobile (Logo aparece aqui em telas pequenas) */}
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden bg-blue-50 p-3 rounded-xl mb-4">
               <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="mt-2 text-gray-500">
                {isSignUp ? 'Comece a organizar seus estudos hoje.' : 'Entre com seus dados para acessar o painel.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {/* Campo Nome (Só no Cadastro) */}
            {isSignUp && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome Completo</label>
                    <div className="relative">
                        <input 
                            required
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                            placeholder="Seu nome"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                        <div className="absolute left-3 top-3.5 text-gray-400">
                             <span className="text-lg">👤</span> {/* Usando emoji simples ou importe User do lucide */}
                        </div>
                    </div>
                </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail Acadêmico</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="aluno@universidade.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  {!isSignUp && <a href="#" className="text-sm text-blue-600 hover:underline">Esqueceu?</a>}
              </div>
              <div className="relative">
                <input 
                  required
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition transform active:scale-[0.98] shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta Grátis' : 'Entrar na Plataforma'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divisor "Ou" */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou</span></div>
          </div>

          {/* Botão Google (Fake visual por enquanto) */}
          <button type="button" className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Continuar com Google
          </button>

          <p className="text-center text-gray-600 text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-blue-600 font-bold ml-1 hover:underline focus:outline-none"
            >
                {isSignUp ? 'Fazer Login' : 'Criar conta grátis'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}