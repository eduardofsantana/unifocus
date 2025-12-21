import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../supabaseClient'
import { User, Mail, LogOut, Loader2, Camera, Lock, GraduationCap, Hash, Moon, Sun, Github, Linkedin, Heart, Code } from 'lucide-react'

export function Profile() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  
  const [fullName, setFullName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [totalSemesters, setTotalSemesters] = useState(8)
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)

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
        setAvatarUrl(data.avatar_url || null)
        setEmail(user.email)
      }
    } catch (error) {
      console.error("Erro:", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date() })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      alert('Foto atualizada!')
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
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
        total_semesters: parseInt(totalSemesters), 
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
      await supabase.auth.updateUser({ password: newPassword })
      alert('Senha alterada!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      alert(error.message)
    } finally {
      setChangingPass(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB] dark:text-blue-400" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 p-4 transition-colors duration-300">
      
      <div className="flex justify-between items-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="text-[#0047AB] dark:text-blue-400" /> Meu Perfil
        </h1>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-yellow-400 shadow-sm transition-all hover:scale-110">
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        
        {/* CARD DADOS PESSOAIS */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center relative transition-colors">
            <div className="relative group mb-6">
                <div className="w-28 h-28 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-[#0047AB] dark:text-blue-400 text-3xl font-bold border-4 border-white dark:border-slate-700 shadow-md overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (fullName ? fullName.charAt(0).toUpperCase() : <User />)}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#0047AB] dark:bg-blue-600 p-2 rounded-full text-white hover:bg-blue-800 transition shadow-md cursor-pointer transform hover:scale-110 active:scale-95">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploading} />
                </label>
            </div>
            
            <form onSubmit={updateProfile} className="w-full space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Nome</label>
                    <div className="relative">
                        <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white" />
                        <User className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-[2]">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Curso</label>
                        <div className="relative">
                            <input value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 transition text-gray-900 dark:text-white" placeholder="Ex: Direito" />
                            <GraduationCap className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Semestres</label>
                        <div className="relative">
                            <input type="number" min="1" max="12" value={totalSemesters} onChange={e => setTotalSemesters(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none font-bold text-center focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 transition text-gray-900 dark:text-white" />
                            <Hash className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-2 top-3.5" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">E-mail</label>
                    <div className="relative">
                        <input value={email} disabled className="w-full pl-10 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed" />
                        <Mail className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-[#0047AB] dark:bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center shadow-lg hover:shadow-none transition-all active:scale-95">
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Salvar Dados'}
                </button>
            </form>
        </div>

        {/* CARD SENHA */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0047AB] dark:text-blue-400" /> Segurança
            </h3>
            <form onSubmit={updatePassword} className="space-y-3">
                <input 
                    type="password" 
                    placeholder="Nova senha" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Confirme a nova senha" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                />
                <button type="submit" disabled={changingPass || !newPassword} className="w-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-50">
                    {changingPass ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Atualizar Senha'}
                </button>
            </form>
        </div>

        <button onClick={signOut} className="w-full text-red-500 font-medium py-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4 inline mr-2" /> Sair da Conta
        </button>

        {/* RODAPÉ DO DESENVOLVEDOR */}
        <div className="text-center pt-8 pb-4 border-t border-gray-100 dark:border-slate-800 mt-8 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-2 font-mono">UniFocus v1.0</p>
            
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                    Desenvolvido com <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> por
                </p>
                <a 
                    href="https://github.com/eduardofsantana" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-gray-700 dark:text-slate-300 hover:text-[#0047AB] dark:hover:text-blue-400 transition flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-full text-sm"
                >
                    <Code className="w-4 h-4" /> Eduardo Felipe
                </a>
            </div>

            <div className="flex justify-center gap-4 mt-4">
                <a href="https://github.com/eduardofsantana" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                    <Github className="w-5 h-5" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full">
                    <Linkedin className="w-5 h-5" />
                </a>
            </div>
            
            <p className="text-[10px] text-gray-300 dark:text-slate-700 mt-6">
                © {new Date().getFullYear()} UniFocus. Feito para estudantes.
            </p>
        </div>

      </div>
    </div>
  )
}