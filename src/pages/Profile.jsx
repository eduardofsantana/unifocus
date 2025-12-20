import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Mail, Save, LogOut, Loader2, Camera } from 'lucide-react'

export function Profile() {
  const { user, signOut } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dados do formulário
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      getProfile()
      setEmail(user.email) // Email vem da autenticação, não editável aqui por segurança
    }
  }, [user])

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignora erro se não tiver perfil ainda
      
      if (data) {
        setFullName(data.full_name || '')
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      alert('Erro ao atualizar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 mt-4">
        <User className="text-[#0047AB]" /> Meu Perfil
      </h1>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Card de Avatar (Visual) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-[#0047AB] text-3xl font-bold mb-3 relative">
                {fullName ? fullName.charAt(0).toUpperCase() : <User />}
                <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border border-gray-200 text-gray-500 hover:text-[#0047AB]">
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            <p className="text-gray-500 text-sm">Aluno UniFocus</p>
        </div>

        {/* Formulário */}
        <form onSubmit={updateProfile} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0047AB] outline-none"
                        placeholder="Seu nome"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (Não editável)</label>
                <div className="relative">
                    <input 
                        type="email" 
                        value={email}
                        disabled
                        className="w-full pl-10 p-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#0047AB] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
            </button>
        </form>

        {/* Zona de Perigo / Sair */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <button 
                onClick={signOut}
                className="w-full text-red-500 hover:bg-red-50 font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
                <LogOut className="w-5 h-5" /> Sair da Conta
            </button>
        </div>

      </div>
    </div>
  )
}