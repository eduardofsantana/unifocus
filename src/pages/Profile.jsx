import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Mail, LogOut, Loader2, Camera, Lock, GraduationCap, Hash } from 'lucide-react'

export function Profile() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  
  // Dados
  const [fullName, setFullName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [totalSemesters, setTotalSemesters] = useState(8) // Novo Estado
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) getProfile()
  }, [user])

  async function getProfile() {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setFullName(data.full_name || '')
        setCourseName(data.course_name || '')
        setTotalSemesters(data.total_semesters || 8)
        setEmail(user.email)
      }
    } catch (error) {
      console.error(error)
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
        course_name: courseName,
        total_semesters: parseInt(totalSemesters), // Salva o total
        updated_at: new Date() 
      }
      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Dados atualizados!')
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return alert('Senhas não conferem.')
    setChangingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      alert('Senha alterada!')
      setNewPassword(''); setConfirmPassword('')
    } catch (error) {
      alert(error.message)
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[#0047AB] text-3xl font-bold mb-6 border-4 border-white shadow-sm">
                {fullName ? fullName.charAt(0).toUpperCase() : <User />}
            </div>
            
            <form onSubmit={updateProfile} className="w-full space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nome</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-[#0047AB] outline-none" />
                </div>

                <div className="flex gap-3">
                    <div className="flex-[2]">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Curso</label>
                        <div className="relative">
                            <input value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" placeholder="Ex: Direito" />
                            <GraduationCap className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Semestres</label>
                        <div className="relative">
                            <input type="number" min="1" max="12" value={totalSemesters} onChange={e => setTotalSemesters(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-center" />
                            <Hash className="w-4 h-4 text-gray-400 absolute left-2 top-3.5" />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-[#0047AB] text-white py-3 rounded-xl font-bold flex justify-center shadow-lg hover:shadow-none transition-all">
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Salvar Dados'}
                </button>
            </form>
        </div>

        {/* Card Senha (igual ao anterior, resumido aqui pra caber) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-[#0047AB]" /> Segurança</h3>
            <form onSubmit={updatePassword} className="space-y-3">
                <input type="password" placeholder="Nova senha" className="w-full p-3 bg-gray-50 border rounded-xl" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <input type="password" placeholder="Confirme" className="w-full p-3 bg-gray-50 border rounded-xl" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button type="submit" disabled={changingPass || !newPassword} className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50">
                    {changingPass ? <Loader2 className="animate-spin w-5 h-5" /> : 'Atualizar Senha'}
                </button>
            </form>
        </div>

        <button onClick={signOut} className="w-full text-red-500 font-medium py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50"><LogOut className="w-4 h-4 inline mr-2" /> Sair</button>
      </div>
    </div>
  )
}