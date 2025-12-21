import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Mail, LogOut, Loader2, Camera, Lock, CheckCircle } from 'lucide-react'

export function Profile() {
  const { user, signOut } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  
  // Dados Pessoais
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Dados de Senha
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      getProfile()
      setEmail(user.email)
    }
  }, [user])

  async function getProfile() {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error && error.code !== 'PGRST116') throw error
      if (data) setFullName(data.full_name || '')
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // --- ATUALIZAR DADOS (NOME) ---
  async function updateProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = { id: user.id, full_name: fullName, updated_at: new Date() }
      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Perfil atualizado!')
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  // --- ATUALIZAR SENHA ---
  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return alert('As senhas não coincidem.')
    }
    if (newPassword.length < 6) {
      return alert('A senha deve ter pelo menos 6 caracteres.')
    }

    setChangingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      alert('Senha alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      alert('Erro ao mudar senha: ' + error.message)
    } finally {
      setChangingPass(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 mt-4">
        <User className="text-[#0047AB]" /> Meu Perfil
      </h1>

      <div className="max-w-md mx-auto space-y-8">
        
        {/* SEÇÃO 1: DADOS PESSOAIS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
            <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center text-[#0047AB] text-4xl font-bold mb-6 relative border-4 border-white shadow-sm">
                {fullName ? fullName.charAt(0).toUpperCase() : <User />}
                <button className="absolute bottom-0 right-0 bg-[#0047AB] p-2 rounded-full text-white hover:bg-blue-800 transition shadow-md">
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={updateProfile} className="w-full space-y-5">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Nome Completo</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0047AB] outline-none font-medium transition"
                            placeholder="Seu nome"
                        />
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">E-mail</label>
                    <div className="relative">
                        <input value={email} disabled className="w-full pl-10 p-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-[#0047AB] text-white py-3 rounded-xl font-bold flex justify-center shadow-lg shadow-blue-200 hover:shadow-none transition-all active:scale-95">
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Salvar Dados'}
                </button>
            </form>
        </div>

        {/* SEÇÃO 2: SEGURANÇA (Trocar Senha) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0047AB]" /> Alterar Senha
            </h3>
            
            <form onSubmit={updatePassword} className="space-y-4">
                <input 
                    type="password" 
                    placeholder="Nova senha"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB]"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Confirme a nova senha"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB]"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
                
                <button 
                    type="submit" 
                    disabled={changingPass || !newPassword}
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-3 rounded-xl transition flex justify-center disabled:opacity-50"
                >
                    {changingPass ? <Loader2 className="animate-spin w-5 h-5" /> : 'Atualizar Senha'}
                </button>
            </form>
        </div>

        {/* BOTÃO SAIR */}
        <button onClick={signOut} className="w-full text-red-500 font-medium py-3 text-sm flex items-center justify-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 transition mb-6">
            <LogOut className="w-4 h-4" /> Sair da Conta
        </button>

      </div>
    </div>
  )
}