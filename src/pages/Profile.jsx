import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../supabaseClient'
import { 
  User, Mail, LogOut, Loader2, Camera, Lock, GraduationCap, 
  Hash, Moon, Sun, Github, Linkedin, Heart, Code, Save, Sliders 
} from 'lucide-react'
import { toast } from 'sonner'

export function Profile() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  
  // Dados do Perfil
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  
  // Configurações Acadêmicas
  const [courseName, setCourseName] = useState('')
  const [totalSemesters, setTotalSemesters] = useState(8)
  const [passingGrade, setPassingGrade] = useState(7.0) // Padrão 7.0

  // Senha
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
        setPassingGrade(data.passing_grade || 7.0)
        setAvatarUrl(data.avatar_url || null)
        setEmail(user.email)
      }
    } catch (error) {
      console.error("Erro:", error.message)
      toast.error('Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

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
      toast.success('Foto de perfil atualizada!')
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message)
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
        passing_grade: parseFloat(passingGrade), // Salva a configuração
        updated_at: new Date() 
      }
      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.warning('As senhas não coincidem.')
    if (newPassword.length < 6) return toast.warning('A senha deve ter no mínimo 6 caracteres.')

    setChangingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      toast.success('Senha alterada com segurança.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Erro ao mudar senha: ' + error.message)
    } finally {
      setChangingPass(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB] dark:text-blue-400" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-32 p-4 transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mt-4 mb-8 max-w-xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Minha Conta
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Gerencie seus dados e preferências</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-yellow-400 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* CARD 1: IDENTIDADE (Avatar e Nome) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center relative transition-colors">
            <div className="relative group mb-6">
                <div className="w-32 h-32 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-[#0047AB] dark:text-blue-400 text-4xl font-bold border-[6px] border-gray-50 dark:border-slate-950 shadow-inner overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        fullName ? fullName.charAt(0).toUpperCase() : <User />
                    )}
                </div>
                <label className="absolute bottom-1 right-1 bg-[#0047AB] dark:bg-blue-600 p-2.5 rounded-full text-white hover:bg-blue-800 transition shadow-lg cursor-pointer transform hover:scale-110 active:scale-95 border-4 border-white dark:border-slate-900">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploading} />
                </label>
            </div>
            
            <div className="w-full space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Nome Completo</label>
                    <div className="relative">
                        <input 
                            value={fullName} onChange={e => setFullName(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white font-medium"
                            placeholder="Seu nome"
                        />
                        <User className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">E-mail</label>
                    <div className="relative">
                        <input value={email} disabled className="w-full pl-10 p-3 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed font-medium opacity-70" />
                        <Mail className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
            </div>
        </div>

        {/* CARD 2: PREFERÊNCIAS ACADÊMICAS */}
        <form onSubmit={updateProfile} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase mb-5 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-800">
                <GraduationCap className="w-4 h-4 text-[#0047AB] dark:text-blue-400" /> Configurações Acadêmicas
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Curso / Graduação</label>
                    <input 
                        value={courseName} onChange={e => setCourseName(e.target.value)} 
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 transition text-gray-900 dark:text-white" 
                        placeholder="Ex: Engenharia de Software" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Duração (Semestres)</label>
                        <div className="relative">
                            <input 
                                type="number" min="1" max="12" value={totalSemesters} onChange={e => setTotalSemesters(e.target.value)} 
                                className="w-full pl-9 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500" 
                            />
                            <Hash className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 mb-1 block">Média p/ Aprovação</label>
                        <div className="relative">
                            <input 
                                type="number" step="0.1" min="0" max="10" value={passingGrade} onChange={e => setPassingGrade(e.target.value)} 
                                className="w-full pl-9 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500" 
                            />
                            <Sliders className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={saving} className="w-full mt-6 bg-[#0047AB] dark:bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-900/10 hover:bg-blue-800 dark:hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-70">
                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-4 h-4" /> Salvar Preferências</>}
            </button>
        </form>

        {/* CARD 3: SEGURANÇA */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase mb-5 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-800">
                <Lock className="w-4 h-4 text-[#0047AB] dark:text-blue-400" /> Segurança
            </h3>
            <form onSubmit={updatePassword} className="space-y-4">
                <input 
                    type="password" placeholder="Nova senha" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white transition"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                />
                <input 
                    type="password" placeholder="Confirme a nova senha" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white transition"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
                />
                <button type="submit" disabled={changingPass || !newPassword} className="w-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-50">
                    {changingPass ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Atualizar Senha'}
                </button>
            </form>
        </div>

        {/* BOTÃO SAIR */}
        <button onClick={signOut} className="w-full text-red-500 font-bold py-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" /> Sair da Conta
        </button>

        {/* RODAPÉ DO DESENVOLVEDOR */}
        <div className="text-center pt-8 pb-4 border-t border-gray-100 dark:border-slate-800 mt-8 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-mono uppercase tracking-widest">UniFocus v1.0</p>
            
            <div className="flex flex-col items-center gap-3">
                <a 
                    href="https://github.com/eduardofsantana" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-gray-700 dark:text-slate-300 hover:text-[#0047AB] dark:hover:text-blue-400 transition flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-5 py-2.5 rounded-full text-sm"
                >
                    <Code className="w-4 h-4" /> Eduardo Felipe
                </a>
            </div>

            <div className="flex justify-center gap-4 mt-5">
                <a href="https://github.com/eduardofsantana" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                    <Github className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/in/eduardofsantana" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full">
                    <Linkedin className="w-5 h-5" />
                </a>
            </div>
            
            <p className="text-[10px] text-gray-300 dark:text-slate-700 mt-6">
                © {new Date().getFullYear()} UniFocus. Feito com <Heart className="w-3 h-3 inline text-red-500" /> para estudantes.
            </p>
        </div>

      </div>
    </div>
  )
}