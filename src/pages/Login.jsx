import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Mail, Lock, ArrowRight, Loader2, CheckCircle, ArrowLeft, User } from 'lucide-react'
import logo from '../assets/logo.png' 

export function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  if (user) {
    navigate('/dashboard')
    return null
  }

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/perfil',
        })
        if (error) throw error
        alert('Se este e-mail tiver cadastro, você receberá um link de acesso em instantes.')
        setIsForgot(false)

      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        alert('Cadastro realizado! Verifique seu e-mail ou faça login.')
        setIsSignUp(false)

      } else {
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

  const bluePrimary = 'bg-[#0047AB]'
  const textBlue = 'text-[#0047AB]'

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LADO ESQUERDO */}
      <div className={`hidden lg:flex w-1/2 ${bluePrimary} relative overflow-hidden items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
        <div className="relative z-10 text-white max-w-md p-12 flex flex-col items-center text-center">
            <img src={logo} alt="UniFocus Logo" className="w-64 mb-8 brightness-0 invert" />
            <h2 className="text-3xl font-bold mb-6 leading-tight">Sua jornada acadêmica,<br/>simplificada.</h2>
            <div className="space-y-4 text-blue-100 text-lg text-left w-full pl-8">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-300" />
                    <span>Controle de faltas e presença</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-300" />
                    <span>Calculadora de notas automática</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-300" />
                    <span>Mural de turmas colaborativo</span>
                </div>
            </div>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          
          <div className="text-center">
            <img src={logo} alt="UniFocus Logo" className="w-48 mx-auto mb-6" />
            <h1 className={`text-2xl font-bold ${textBlue}`}>
                {isForgot ? 'Recuperar Senha' : (isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta')}
            </h1>
            <p className="mt-2 text-gray-500">
                {isForgot ? 'Enviaremos um link mágico para seu e-mail.' : (isSignUp ? 'Preencha os dados para começar.' : 'Entre para acessar seu painel.')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            
            {isSignUp && !isForgot && (
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome Completo</label>
                    <div className="relative">
                        {/* 'text-gray-900' forçado para garantir legibilidade */}
                        <input 
                            required
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] outline-none transition text-gray-900 placeholder-gray-400"
                            placeholder="Seu nome"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                        <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    </div>
                </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {!isForgot && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700">Senha</label>
                      {!isSignUp && (
                          <button type="button" onClick={() => setIsForgot(true)} className={`text-sm ${textBlue} hover:underline`}>
                            Esqueceu?
                          </button>
                      )}
                  </div>
                  <div className="relative">
                    <input 
                      required
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full ${bluePrimary} hover:bg-[#003580] text-white font-bold py-3.5 rounded-xl transition transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  {isForgot ? 'Enviar Link de Acesso' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                  {!isForgot && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>

            {isForgot && (
                <button type="button" onClick={() => setIsForgot(false)} className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </button>
            )}
          </form>

          {!isForgot && (
              <p className="text-center text-gray-600 text-sm">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem conta?'}
                <button onClick={() => setIsSignUp(!isSignUp)} className={`${textBlue} font-bold ml-1 hover:underline focus:outline-none`}>
                    {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
                </button>
              </p>
          )}

        </div>
      </div>
    </div>
  )
}