import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Mail, Save, LogOut, Loader2, Camera, Award, Plus, Trash2, CheckCircle, Clock } from 'lucide-react'

export function Profile() {
  const { user, signOut } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dados Pessoais
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Dados de Certificações
  const [certs, setCerts] = useState([])
  const [newCertName, setNewCertName] = useState('')
  const [newCertProvider, setNewCertProvider] = useState('')
  const [newCertStatus, setNewCertStatus] = useState('Em andamento')
  const [addingCert, setAddingCert] = useState(false)

  useEffect(() => {
    if (user) {
      getProfile()
      fetchCertifications()
      setEmail(user.email)
    }
  }, [user])

  // --- FUNÇÕES DE PERFIL ---
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

  // --- FUNÇÕES DE CERTIFICAÇÕES ---
  async function fetchCertifications() {
    const { data } = await supabase.from('certifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCerts(data || [])
  }

  async function addCertification(e) {
    e.preventDefault()
    if (!newCertName) return
    setAddingCert(true)

    try {
      const { error } = await supabase.from('certifications').insert([{
        user_id: user.id,
        name: newCertName,
        provider: newCertProvider,
        status: newCertStatus
      }])

      if (error) throw error
      
      setNewCertName('')
      setNewCertProvider('')
      fetchCertifications()
    } catch (error) {
      alert(error.message)
    } finally {
      setAddingCert(false)
    }
  }

  async function deleteCert(id) {
    await supabase.from('certifications').delete().eq('id', id)
    setCerts(certs.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 mt-4">
        <User className="text-[#0047AB]" /> Meu Perfil
      </h1>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* AVATAR + FORMULÁRIO BÁSICO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-[#0047AB] text-3xl font-bold mb-3 relative">
                {fullName ? fullName.charAt(0).toUpperCase() : <User />}
                <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border border-gray-200 text-gray-500 hover:text-[#0047AB]">
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={updateProfile} className="w-full space-y-4 mt-2">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0047AB] outline-none font-medium"
                        placeholder="Seu nome"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
                    <input value={email} disabled className="w-full p-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 cursor-not-allowed" />
                </div>
                <button type="submit" disabled={saving} className="w-full bg-[#0047AB] text-white py-2 rounded-lg font-bold text-sm flex justify-center">
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar Alterações'}
                </button>
            </form>
        </div>

        {/* --- NOVA SEÇÃO: CURSOS E CERTIFICAÇÕES --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Award className="text-[#0047AB]" /> Cursos Extras
            </h3>

            {/* Lista de Cursos */}
            <div className="space-y-3 mb-6">
                {certs.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-2">Nenhum curso adicionado.</p>
                ) : (
                    certs.map(cert => (
                        <div key={cert.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{cert.name}</p>
                                <p className="text-xs text-gray-500">{cert.provider}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {cert.status === 'Concluído' ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Concluído
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Cursando
                                    </span>
                                )}
                                <button onClick={() => deleteCert(cert.id)} className="text-gray-300 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Formulário de Adicionar Curso */}
            <form onSubmit={addCertification} className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Adicionar Novo</p>
                <div className="grid grid-cols-1 gap-2">
                    <input 
                        placeholder="Nome do Curso (ex: Python para Dados)" 
                        className="w-full p-2 text-sm bg-gray-50 border rounded-lg"
                        value={newCertName}
                        onChange={e => setNewCertName(e.target.value)}
                        required
                    />
                    <div className="flex gap-2">
                        <input 
                            placeholder="Instituição (ex: Udemy)" 
                            className="flex-1 p-2 text-sm bg-gray-50 border rounded-lg"
                            value={newCertProvider}
                            onChange={e => setNewCertProvider(e.target.value)}
                        />
                        <select 
                            className="p-2 text-sm bg-gray-50 border rounded-lg"
                            value={newCertStatus}
                            onChange={e => setNewCertStatus(e.target.value)}
                        >
                            <option value="Em andamento">Cursando</option>
                            <option value="Concluído">Concluído</option>
                        </select>
                    </div>
                    <button type="submit" disabled={addingCert} className="mt-1 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                         <Plus className="w-4 h-4" /> Adicionar Curso
                    </button>
                </div>
            </form>
        </div>

        {/* Botão Sair */}
        <button onClick={signOut} className="w-full text-red-500 font-medium py-2 text-sm flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <LogOut className="w-4 h-4" /> Sair da Conta
        </button>

      </div>
    </div>
  )
}